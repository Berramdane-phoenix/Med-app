import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldPlus, Mail, Lock, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    terms: '',
  });

  const navigate = useNavigate();

  const fullNameIsValid = (name: string) => /^[a-zA-Z\s]+$/.test(name);
  const emailIsValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, fullName: 'Full name is required' }));
    } else if (!fullNameIsValid(value)) {
      setErrors((prev) => ({
        ...prev,
        fullName: 'Only letters and spaces allowed',
      }));
    } else {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
    } else if (!emailIsValid(value)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Invalid email format',
      }));
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

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setTermsChecked(checked);
    if (!checked) {
      setErrors((prev) => ({
        ...prev,
        terms: 'You must agree to the Terms of Service',
      }));
    } else {
      setErrors((prev) => ({ ...prev, terms: '' }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if terms is checked
    if (!termsChecked) {
      setErrors((prev) => ({
        ...prev,
        terms: 'You must agree to the Terms of Service',
      }));
      setError('Please fix validation errors before submitting.');
      return;
    }

    // Check other errors
    if (errors.fullName || errors.email || errors.password || errors.terms) {
      setError('Please fix validation errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        setSuccessMessage(
          'Sign up successful! Please check your email to confirm your account.'
        );
        setLoading(false);
        return;
      }

      const userId = data.user.id;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          email: email.toLowerCase(),
        });

      if (profileError) throw profileError;

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <h1>Create Account</h1>
        <p>Sign up to get started with MediCare</p>
      </div>

      <form className="auth__form" onSubmit={handleRegister} noValidate>
        {error && <div className="alert alert--error mb-4">{error}</div>}
        {successMessage && (
          <div className="alert alert--success mb-4">{successMessage}</div>
        )}

        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <div className="input-group">
            <div className="input-group-text">
              <UserPlus size={18} />
            </div>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="Enter your full name"
              required
              className="form-control"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
          </div>
          {errors.fullName && (
            <div id="fullName-error" className="error-text" role="alert" aria-live="assertive">
              {errors.fullName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-group">
            <div className="input-group-text">
              <Mail size={18} />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              className="form-control"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <div id="email-error" className="error-text" role="alert" aria-live="assertive">
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <div className="input-group-text">
              <Lock size={18} />
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create a password"
              required
              className="form-control"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>
          {errors.password && (
            <div id="password-error" className="error-text" role="alert" aria-live="assertive">
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-check mb-4">
          <input
            type="checkbox"
            id="terms"
            checked={termsChecked}
            onChange={handleTermsChange}
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            aria-invalid={!!errors.terms}
            required
          />
          <label htmlFor="terms">
            <span className="terms">I agree to the Terms of Service and Privacy Policy</span>
          </label>
          {errors.terms && (
            <div
              id="terms-error"
              className="error-text"
              role="alert"
              aria-live="assertive"
            >
              {errors.terms}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={loading || Object.values(errors).some(Boolean)}
        >
          <UserPlus size={18} />
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="auth__footer">
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
