import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { AuthLayout } from './AuthLayout';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email">
        <div className="auth-success">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
        </div>
        <div className="auth-links">
          <span><Link to="/login">Back to sign in</Link></span>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account">
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
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
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="auth-input"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div className="auth-links">
        <span>Already have an account? <Link to="/login">Sign in</Link></span>
      </div>
    </AuthLayout>
  );
}
