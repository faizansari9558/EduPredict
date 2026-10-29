import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoResetUrl, setDemoResetUrl] = useState('');

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.requestPasswordReset(email);
      setMessage(response.message);
      setDemoResetUrl(response.demoOnly ? response.demoResetUrl : '');
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
        {demoResetUrl && <p className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">Demo reset email link: <a className="underline font-medium" href={demoResetUrl}>Open reset page</a><span className="block text-xs mt-1">Development only. Configure SMTP before production.</span></p>}
        {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
        <form onSubmit={submit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider">Institutional email</label>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface" />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
          <Link to="/login" className="block text-center text-sm text-secondary hover:underline">Back to login</Link>
        </form>
      </div>
    </div>
  );
}
