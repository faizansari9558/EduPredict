import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Multi-step Registration State (Phase 1: Flowchart Steps)
  // Step 1: University Records & Identity (Email + User ID)
  // Step 2: Send OTP & Verify Email
  // Step 3: Set Password & Confirm Password
  // Step 4: Account Active & Login Redirect
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('student');

  // Step 1 Form Data
  const [fullName, setFullName] = useState('Faizan Ansari');
  const [email, setEmail] = useState('faizan.ansari@university.edu');
  const [userIdNumber, setUserIdNumber] = useState('21CS042');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  // Step 2 OTP State
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 3 Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  // Timer for OTP Resend
  useEffect(() => {
    let timer;
    if (currentStep === 2 && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    } else if (otpCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

  // Auto-redirect timer when Account is Activated (Step 4)
  useEffect(() => {
    let timer;
    if (currentStep === 4 && redirectCountdown > 0) {
      timer = setInterval(() => setRedirectCountdown((prev) => prev - 1), 1000);
    } else if (currentStep === 4 && redirectCountdown === 0) {
      navigate('/login', { state: { prefillEmail: email, role } });
    }
    return () => clearInterval(timer);
  }, [currentStep, redirectCountdown, email, role, navigate]);

  // Auto infer role based on email or ID
  const getInferredRole = () => {
    const e = email.toLowerCase();
    const id = userIdNumber.toUpperCase();
    if (e.includes('teacher') || e.includes('faculty') || id.startsWith('EMP') || id.startsWith('FAC')) return 'teacher';
    if (e.includes('admin') || id.startsWith('ADM')) return 'admin';
    return 'student';
  };

  // STEP 1: Verify University Records & Send OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !userIdNumber.trim() || !fullName.trim()) {
      setError('Please fill all required fields to check university records.');
      return;
    }

    const currentRole = getInferredRole();
    setRole(currentRole);

    setLoading(true);
    try {
      const res = await authApi.checkUniversityRecord({
        email: email.trim(),
        userIdNumber: userIdNumber.trim(),
        fullName: fullName.trim(),
        role: currentRole
      });

      setSuccessMsg('University record validated! Verification code sent to your official email.');
      setOtpCountdown(60);
      setCanResend(false);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'University record verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.checkUniversityRecord({
        email: email.trim(),
        userIdNumber: userIdNumber.trim(),
        fullName: fullName.trim(),
        role
      });
      setSuccessMsg('A new OTP has been sent to your email.');
      setOtpCountdown(60);
      setCanResend(false);
    } catch (err) {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp({
        email: email.trim(),
        otp: otp.trim()
      });

      if (res?.success) {
        setVerificationToken(res.verificationToken);
        setSuccessMsg('Email verified successfully! Now set your secure account password.');
        setCurrentStep(3);
      } else {
        setError(res?.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Set Password & Activate Account
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        userIdNumber: userIdNumber.trim(),
        department,
        password,
        verificationToken
      });

      setSuccessMsg('Account activated successfully!');
      setCurrentStep(4);
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-secondary/20 selection:text-secondary">
      {/* Top Header Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center space-y-2">
          <Logo size="lg" linkTo="/" />
          <p className="text-xs text-on-surface-variant font-medium">
            Smart Student Academic &amp; Placement Prediction System
          </p>
        </div>

        {/* Multi-Step Flow Indicator Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between relative">
            {/* Step 1 Node */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= 1
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {currentStep > 1 ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  '1'
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 text-on-surface">ID Check</span>
            </div>

            {/* Connecting Line 1-2 */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                currentStep >= 2 ? 'bg-secondary' : 'bg-outline-variant/40'
              }`}
            />

            {/* Step 2 Node */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= 2
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {currentStep > 2 ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  '2'
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 text-on-surface">OTP Verify</span>
            </div>

            {/* Connecting Line 2-3 */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                currentStep >= 3 ? 'bg-secondary' : 'bg-outline-variant/40'
              }`}
            />

            {/* Step 3 Node */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= 3
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {currentStep > 3 ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  '3'
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 text-on-surface">Password</span>
            </div>

            {/* Connecting Line 3-4 */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                currentStep === 4 ? 'bg-emerald-500' : 'bg-outline-variant/40'
              }`}
            />

            {/* Step 4 Node */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep === 4
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {currentStep === 4 ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  '4'
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 text-on-surface">Active</span>
            </div>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>
                {error}
                {error.toLowerCase().includes('already has an account') && (
                  <> <Link to="/login" className="font-bold underline">Go to sign in</Link></>
                )}
              </span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && currentStep !== 4 && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: IDENTITY & UNIVERSITY RECORDS VERIFICATION                         */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="font-headline font-bold text-2xl text-primary">
                  Verify University Identity
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Step 1: Enter your official university credentials assigned during admission or hiring
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Faizan Ansari"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Official Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="faizan.ansari@university.edu"
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      University User ID (Roll / Admission / Employee ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={userIdNumber}
                      onChange={(e) => setUserIdNumber(e.target.value)}
                      placeholder="e.g. 21CS042 or EMP-9021"
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Academic Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                  >
                    <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                {/* Verification Notice */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-2.5 text-left">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    EduPredict verifies your email and ID with pre-authorized university records before generating a 6-digit OTP code.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 shadow-md shadow-secondary/20"
                  icon="send"
                  loading={loading}
                >
                  Verify Record &amp; Send OTP
                </Button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP EMAIL VERIFICATION                                            */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2 border border-secondary/20">
                  <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
                </div>
                <h2 className="font-headline font-bold text-2xl text-primary">
                  Email Verification
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Step 2: Enter the 6-digit verification code sent to your official address
                </p>
                <p className="text-xs font-bold text-secondary">{email}</p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center mb-2">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="482910"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 rounded-2xl border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 bg-surface text-on-surface"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-on-surface-variant hover:text-primary font-semibold inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Change Email / ID
                  </button>

                  <div>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-secondary font-bold hover:underline"
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-on-surface-variant">
                        Resend in <span className="font-bold text-primary">{otpCountdown}s</span>
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 shadow-md shadow-secondary/20"
                  icon="verified"
                  loading={loading}
                >
                  Verify OTP &amp; Proceed
                </Button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SET PASSWORD & CONFIRM PASSWORD                                   */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                  <span className="material-symbols-outlined text-[26px]">lock_reset</span>
                </div>
                <h2 className="font-headline font-bold text-2xl text-primary">
                  Set Account Password
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Step 3: Create a secure password for your verified university account
                </p>
              </div>

              <form onSubmit={handleStep3Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Create New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-surface text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        password.length >= 6 ? 'bg-emerald-500' : 'bg-outline-variant'
                      }`}
                    />
                    <span>At least 6 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        password && password === confirmPassword
                          ? 'bg-emerald-500'
                          : 'bg-outline-variant'
                      }`}
                    />
                    <span>Passwords match</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 shadow-md shadow-secondary/20"
                  icon="lock_open"
                  loading={loading}
                >
                  Activate Account &amp; Set Password
                </Button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: ACCOUNT ACTIVATED & LOGIN REDIRECT                                 */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>

              <div className="space-y-1">
                <h2 className="font-headline font-black text-2xl text-primary">
                  Account Active!
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Your university records have been verified and your password is set.
                </p>
              </div>

              {/* Verified Account Summary Card */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="text-on-surface-variant">Full Name</span>
                  <span className="font-bold text-primary">{fullName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="text-on-surface-variant">Official Email</span>
                  <span className="font-bold text-primary">{email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="text-on-surface-variant">University ID</span>
                  <span className="font-bold text-primary">{userIdNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Account Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Verified &amp; Active
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  to="/login"
                  variant="primary"
                  className="w-full py-3 shadow-md shadow-secondary/20"
                  icon="login"
                >
                  Proceed to Sign In ({redirectCountdown}s)
                </Button>
                <p className="text-[11px] text-on-surface-variant">
                  Redirecting to the single unified sign-in page automatically...
                </p>
              </div>
            </div>
          )}

          {/* Bottom Card Footer with Sign-In link */}
          {currentStep < 4 && (
            <div className="pt-2 text-center text-xs text-on-surface-variant border-t border-outline-variant/20">
              Already registered your account?{' '}
              <Link to="/login" className="font-bold text-secondary hover:underline">
                Sign In here
              </Link>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
