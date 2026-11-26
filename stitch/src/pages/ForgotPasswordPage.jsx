import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  async function sendOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.requestPasswordReset(email);
      setMessage(response.message);
      setDemoOtp(response.demoOnly ? response.demoOtp : '');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.verifyPasswordResetOtp(email.trim(), otp.trim());
      setVerificationToken(response.verificationToken);
      setMessage('OTP verified. Create your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function setNewPassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.resetPassword(email.trim(), verificationToken, password);
      setMessage(response.message);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center"><Logo size="lg" linkTo="/" /><h1 className="font-headline font-bold text-2xl mt-3">Reset password</h1></div>
        {message && <p className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">{message}</p>}
        {demoOtp && <p className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">Demo OTP: <span className="font-bold">{demoOtp}</span><span className="block text-xs mt-1">Development only. Configure SMTP before production.</span></p>}
        {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
        {step === 1 && (
          <form onSubmit={sendOtp} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider">Institutional email</label>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Checking...' : 'Send demo OTP'}</Button>
            <Link to="/login" className="block text-center text-sm text-secondary hover:underline">Back to login</Link>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={verifyOtp} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider">Enter 6-digit OTP</label>
            <input required inputMode="numeric" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</Button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={setNewPassword} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider">New password</label>
            <input required type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface" />
            <label className="block text-xs font-bold uppercase tracking-wider">Confirm password</label>
            <input required type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface" />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</Button>
          </form>
        )}
        {step === 4 && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-4 text-center">
            <Link to="/login" className="block"><Button className="w-full">Go to login</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
