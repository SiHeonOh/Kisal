import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { AuthLayout } from './AuthLayout';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <AuthLayout title="Email sent">
        <div className="auth-success">
          If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
        </div>
        <div className="auth-links">
          <span><Link to="/login">Back to sign in</Link></span>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password">
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email address</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <div className="auth-links">
        <span><Link to="/login">Back to sign in</Link></span>
      </div>
    </AuthLayout>
  );
}
