import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldPlus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; 

export default function ResetLink() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const emailIsValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!emailIsValid(email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setLoading(true);
    

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://phoenix-medicare-app.netlify.app/resetpassword',
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        message:
          'If this email is registered, a password reset link has been sent. Please check your inbox.',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth__header">
        <a href="/" className="logo">
          <ShieldPlus size={32} />
          <span>MediCare</span>
        </a>
        <div className="header">
          <h2>Reset Your Password</h2>
          <p className="text-sm">Enter your email to receive a reset link</p>
        </div>
      </div>

      <form className="auth__form" onSubmit={handleResetLink} noValidate>
        {status && (
          <div
            className={`alert mb-4 ${
              status.type === 'error' ? 'alert--error' : 'alert--success'
            }`}
            role="alert"
            aria-live="assertive"
            id="status-message"
          >
            {status.message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="input-group">
            <div className="input-group-text">
              <Mail size={18} />
            </div>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby={status ? 'status-message' : undefined}
              aria-invalid={status?.type === 'error' ? true : false}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="btn btn-sm btn-primary w-100 mt-3"
          disabled={loading || !emailIsValid(email)}
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="auth__footer">
        <p>
          Remember your password?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
