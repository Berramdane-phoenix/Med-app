import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const successRef = useRef<HTMLDivElement>(null);

  const emailIsValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!emailIsValid(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showEmailError = emailTouched && (!email || !emailIsValid(email));


  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.focus();
    }
  }, [success]);

  return (
    <div className="auth-card">
      <div className="auth__header">
        <a href="/" className="logo">
          <ShieldPlus size={32} />
          <span>MediCare</span>
        </a>
        <div className="header">
          <h2>Reset Password</h2>
          <p className="text-sm">Enter your email to receive a password reset link</p>
        </div>
      </div>

      {success ? (
        <div
          className="auth__header"
          tabIndex={-1} 
          ref={successRef}
          aria-live="polite"  
        >
          <div className="alert alert--success text-sm mb-4">
            Password reset instructions have been sent to your email.
          </div>
          <Link to="/login">
            <Button className="btn btn-primary btn-sm">Return to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth__form" noValidate>
          {error && (
            <div
              className="alert alert--error text-sm mb-4"
              role="alert"       
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label mb-4">
              Email Address
            </label>
            <div className="input-group">
              <div className="input-group-text">
                <Mail size={18} aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Enter your email"
                className="form-control"
                aria-invalid={showEmailError ? 'true' : 'false'}
                aria-describedby={showEmailError ? 'email-error' : undefined}
                required
              />
            </div>
            {showEmailError && (
              <small id="email-error" className="form-error" role="alert">
                Please enter a valid email address
              </small>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn btn-sm btn-primary mt-3"
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <div className="auth__footer">
        <p>
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
