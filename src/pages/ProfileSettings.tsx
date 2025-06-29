import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Save, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Download,
  Eye,
  EyeOff,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, isValid, parseISO } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  notifications_enabled: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Editable fields state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit mode states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // 2FA states
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Form validation functions
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Full name must be at least 2 characters';
    if (name.trim().length > 100) return 'Full name must be less than 100 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validatePhone = (phoneNumber: string): string | undefined => {
    if (!phoneNumber.trim()) return undefined; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return undefined;
  };

  const validateTotpCode = (code: string): string | undefined => {
    if (!code.trim()) return 'Authentication code is required';
    if (!/^\d{6}$/.test(code.trim())) return 'Authentication code must be 6 digits';
    return undefined;
  };

  // Clear errors when inputs change
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile does not exist, create it
          const newProfileData = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || null,
            notifications_enabled: true,
            two_factor_enabled: false,
          };

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfileData)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
          setFullName(newProfile.full_name || '');
          setPhone(newProfile.phone || '');
          setNotificationsEnabled(newProfile.notifications_enabled);
          setTwoFactorEnabled(newProfile.two_factor_enabled || false);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setNotificationsEnabled(data.notifications_enabled);
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setErrors({ general: 'Failed to load profile: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    // Validate form
    const nameError = validateFullName(editName);
    const phoneError = validatePhone(editPhone);

    if (nameError || phoneError) {
      setErrors({
        fullName: nameError,
        phone: phoneError,
      });
      return;
    }

    setSaving(true);
    setErrors({});
    setSuccess(null);

    try {
      const updates = {
        full_name: editName.trim(),
        phone: editPhone.trim() || null,
        notifications_enabled: notificationsEnabled,
        two_factor_enabled: twoFactorEnabled,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setFullName(updates.full_name);
      setPhone(updates.phone || '');
      setSuccess('Profile updated successfully!');
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const errorMessage = 'Failed to update profile: ' + (err.message || 'Unknown error');
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate passwords
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setPasswordLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const errorMessage = 'Failed to update password: ' + (err.message || 'Unknown error');
      setErrors({ password: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  async function handleEnable2FA() {
    try {
      setErrors({});
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Healthcare App - ${new Date().toLocaleDateString()}`,
      });
      
      if (error) throw error;
      
      if (data?.totp) {
        setQrUrl(data.totp.qr_code || null);
        setFactorId(data.id || null);
        setShow2FADialog(true);
        toast.success('Scan the QR code with your authenticator app');
      }
    } catch (error: any) {
      const errorMessage = 'Failed to enable 2FA: ' + error.message;
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  }

  async function handleVerify2FA() {
    const codeError = validateTotpCode(totpCode);
    if (codeError) {
      setErrors({ general: codeError });
      return;
    }

    if (!factorId) {
      setErrors({ general: 'Missing verification data. Please try again.' });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      // Create challenge if needed
      let currentChallengeId = challengeId;
      if (!currentChallengeId) {
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId,
        });
        if (challengeError) throw challengeError;
        currentChallengeId = challengeData?.id || null;
        setChallengeId(currentChallengeId);
      }

      if (!currentChallengeId) {
        throw new Error('Failed to create verification challenge');
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: currentChallengeId,
        code: totpCode.trim(),
      });

      if (error) throw error;

      toast.success('2FA enabled successfully!');
      setShow2FADialog(false);
      resetTwoFactorState();
      await fetchProfile(); // Refresh profile to update 2FA status
    } catch (err: any) {
      const errorMessage = 'Verification failed: ' + (err.message || 'Invalid code');
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }

  function resetTwoFactorState() {
    setTotpCode('');
    setQrUrl(null);
    setFactorId(null);
    setChallengeId(null);
    setErrors({});
  }

  function handleCancel2FADialog() {
    setShow2FADialog(false);
    resetTwoFactorState();
  }

  function handleExportData() {
    if (!profile) return;
    
    try {
      const exportData = {
        profile: {
          ...profile,
          exported_at: new Date().toISOString(),
        },
        export_info: {
          version: '1.0',
          format: 'JSON',
          description: 'Healthcare App Profile Data Export',
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Profile data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="profile-settings">
        <div className="profile-settings__loading">
          <Loader2 className="loading-spinner" />
          <span className="loading-text">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-settings">
        <div className="profile-settings__error">
          <AlertCircle className="error-icon" />
          <h2>Profile Not Found</h2>
          <p>Unable to load your profile information.</p>
          <Button onClick={fetchProfile} className="btn btn--primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      {/* Header */}
      <header className="profile-settings__header">
        <div className="profile-avatar">
          <span className="profile-avatar__initials">{getUserInitials()}</span>
        </div>
        <div className="profile-header-info">
          <h1 className="profile-settings__title">Account Settings</h1>
          <p className="profile-settings__subtitle">
            Manage your personal information and account preferences
          </p>
        </div>
      </header>

      {/* Global Error Display */}
      {errors.general && (
        <div className="alert alert--error">
          <AlertCircle className="alert__icon" />
          <div className="alert__content">
            <p className="alert__message">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Global Success Display */}
      {success && (
        <div className="alert alert--success">
          <CheckCircle className="alert__icon" />
          <div className="alert__content">
            <p className="alert__message">{success}</p>
          </div>
        </div>
      )}

      <div className="profile-settings__content">
        {/* Personal Information */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-group">
              <User className="settings-card__icon" />
              <h2 className="settings-card__title">Personal Information</h2>
            </div>
          </div>

          <div className="settings-card__body">
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="form-required">*</span>
                </label>
                {editing ? (
                  <div className="form-input-wrapper">
                    <input
                      id="fullName"
                      type="text"
                      className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        clearError('fullName');
                      }}
                      placeholder="Enter your full name"
                      required
                      maxLength={100}
                    />
                    {errors.fullName && (
                      <span className="form-error">{errors.fullName}</span>
                    )}
                  </div>
                ) : (
                  <p className="form-value">{fullName || '(Not set)'}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-input form-input--disabled"
                  value={profile?.email || ''}
                  disabled
                  title="Email cannot be changed here"
                />
                <p className="form-help">Email cannot be changed from this page</p>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                {editing ? (
                  <div className="form-input-wrapper">
                    <input
                      id="phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                      value={editPhone}
                      onChange={(e) => {
                        setEditPhone(e.target.value);
                        clearError('phone');
                      }}
                      placeholder="Enter your phone number"
                      maxLength={20}
                    />
                    {errors.phone && (
                      <span className="form-error">{errors.phone}</span>
                    )}
                  </div>
                ) : (
                  <p className="form-value">{phone || '(Not set)'}</p>
                )}
              </div>

              <div className="form-group form-group--checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    disabled={!editing}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">Enable email notifications</span>
                </label>
              </div>

              <div className="form-info-group">
                <div className="form-info-item">
                  <Calendar className="form-info-icon" />
                  <span className="form-info-label">Member Since:</span>
                  <span className="form-info-value">
                    {profile?.created_at && isValid(parseISO(profile.created_at))
                      ? format(parseISO(profile.created_at), 'PPP')
                      : 'N/A'}
                  </span>
                </div>

                <div className="form-info-item">
                  <Shield className="form-info-icon" />
                  <span className="form-info-label">2FA Status:</span>
                  <span className={`form-info-badge ${twoFactorEnabled ? 'form-info-badge--success' : 'form-info-badge--warning'}`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                {!editing ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setEditName(fullName);
                      setEditPhone(phone);
                      setSuccess(null);
                      setErrors({});
                    }}
                    className="btn btn--primary"
                  >
                    <Edit className="btn__icon" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="form-actions-group">
                    <Button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setErrors({});
                        setSuccess(null);
                      }}
                      className="btn btn--secondary"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="btn btn--primary"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="btn__icon btn__icon--spinning" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="btn__icon" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Account Security */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-group">
              <Shield className="settings-card__icon" />
              <h2 className="settings-card__title">Account Security</h2>
            </div>
          </div>

          <div className="settings-card__body">
            {/* Two-Factor Authentication */}
            <div className="security-item">
              <div className="security-item__content">
                <h3 className="security-item__title">Two-Factor Authentication</h3>
                <p className="security-item__description">
                  Add an extra layer of security to your account with 2FA
                </p>
                <div className="security-item__status">
                  <span className={`status-badge ${twoFactorEnabled ? 'status-badge--success' : 'status-badge--warning'}`}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="security-item__actions">
                {!twoFactorEnabled && (
                  <Button 
                    onClick={handleEnable2FA} 
                    className="btn btn--primary btn--small"
                  >
                    Enable 2FA
                  </Button>
                )}
              </div>
            </div>

            {/* 2FA Setup Dialog */}
            {show2FADialog && (
              <div className="two-factor-dialog">
                <div className="two-factor-dialog__header">
                  <h3 className="two-factor-dialog__title">Set Up Two-Factor Authentication</h3>
                  <button
                    onClick={handleCancel2FADialog}
                    className="two-factor-dialog__close"
                    aria-label="Close dialog"
                  >
                    <X className="icon" />
                  </button>
                </div>

                <div className="two-factor-dialog__body">
                  <div className="two-factor-step">
                    <h4 className="two-factor-step__title">1. Scan QR Code</h4>
                    <p className="two-factor-step__description">
                      Use your authenticator app to scan this QR code
                    </p>
                    {qrUrl ? (
                      <div className="qr-code-container">
                        <img
                          src={qrUrl}
                          alt="2FA QR Code"
                          className="qr-code"
                        />
                      </div>
                    ) : (
                      <div className="qr-code-loading">
                        <Loader2 className="loading-spinner" />
                        <span>Loading QR code...</span>
                      </div>
                    )}
                  </div>

                  <div className="two-factor-step">
                    <h4 className="two-factor-step__title">2. Enter Verification Code</h4>
                    <p className="two-factor-step__description">
                      Enter the 6-digit code from your authenticator app
                    </p>
                    <div className="form-group">
                      <input
                        type="text"
                        className={`form-input totp-input ${errors.general ? 'form-input--error' : ''}`}
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => {
                          setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          clearError('general');
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      {errors.general && (
                        <span className="form-error">{errors.general}</span>
                      )}
                    </div>
                  </div>

                  <div className="two-factor-dialog__actions">
                    <Button
                      onClick={handleCancel2FADialog}
                      className="btn btn--secondary"
                      disabled={isVerifying}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerify2FA}
                      className="btn btn--primary"
                      disabled={isVerifying || totpCode.length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="btn__icon btn__icon--spinning" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="btn__icon" />
                          Verify & Enable
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Export */}
            <div className="security-item">
              <div className="security-item__content">
                <h3 className="security-item__title">Data Export</h3>
                <p className="security-item__description">
                  Download a copy of your account data in JSON format
                </p>
              </div>
              <div className="security-item__actions">
                <Button
                  onClick={handleExportData}
                  className="btn btn--secondary btn--small"
                >
                  <Download className="btn__icon" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title-group">
              <Key className="settings-card__icon" />
              <h2 className="settings-card__title">Change Password</h2>
            </div>
          </div>

          <div className="settings-card__body">
            <form onSubmit={changePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password <span className="form-required">*</span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    className={`form-input form-input--password ${errors.password ? 'form-input--error' : ''}`}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearError('password');
                    }}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                  </button>
                  {errors.password && (
                    <span className="form-error">{errors.password}</span>
                  )}
                </div>
                <div className="password-requirements">
                  <p className="password-requirements__title">Password must contain:</p>
                  <ul className="password-requirements__list">
                    <li className={newPassword.length >= 8 ? 'requirement--met' : ''}>
                      At least 8 characters
                    </li>
                    <li className={/(?=.*[a-z])/.test(newPassword) ? 'requirement--met' : ''}>
                      One lowercase letter
                    </li>
                    <li className={/(?=.*[A-Z])/.test(newPassword) ? 'requirement--met' : ''}>
                      One uppercase letter
                    </li>
                    <li className={/(?=.*\d)/.test(newPassword) ? 'requirement--met' : ''}>
                      One number
                    </li>
                    <li className={/(?=.*[@$!%*?&])/.test(newPassword) ? 'requirement--met' : ''}>
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password <span className="form-required">*</span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`form-input form-input--password ${errors.confirmPassword ? 'form-input--error' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                    }}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                  </button>
                  {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  className="btn btn--primary"
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="btn__icon btn__icon--spinning" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="btn__icon" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}