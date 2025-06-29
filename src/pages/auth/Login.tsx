import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldPlus, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const navigate = useNavigate();
  const emailIsValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
    } else if (!emailIsValid(value)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
    } else if (value.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password must be at least 6 characters',
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.email || errors.password) {
      setError('Please fix validation errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-card">
      <div className="auth__header">
        <a href="/" className="logo">
          <ShieldPlus size={32} aria-hidden="true" />
          <span>MediCare</span>
        </a>
        <div className="d-flex align-items-center flex-column ">
          <h1 className="text-primary">Welcome Back</h1>
          <p className="text-sm w-90">Sign in to access your healthcare dashboard</p>
        </div>
      </div>

      <form className="auth__form" onSubmit={handleLogin} noValidate>
        {error && (
          <div
            className="alert alert--error form-error mb-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="d-flex">
              <AlertCircle size={18} aria-hidden="true" />
              <span className='ml-2'>{error}</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <Mail size={18} aria-hidden="true" />
            </span>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <div
              id="email-error"
              className="error-text"
              role="alert"
              aria-live="assertive"
            >
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <div className="d-flex justify-content-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link to="/forgotpassword" className="text-sm text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="input-group">
            <span className="input-group-text">
              <Lock size={18} aria-hidden="true" />
            </span>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              required
              autoComplete=""
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>
          {errors.password && (
            <div
              id="password-error"
              className="error-text"
              role="alert"
              aria-live="assertive"
            >
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-check mb-4">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <Button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={loading || Object.values(errors).some(Boolean)}
          aria-busy={loading}
        >
          <LogIn size={18} aria-hidden="true" />
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="auth__footer">
        <p>
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>

  );
}
