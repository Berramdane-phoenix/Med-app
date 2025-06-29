import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Settings, 
  Shield, 
  Key,
  MapPin,
  Bell,
  Activity,
  FileText,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Stethoscope,
  Pill
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
  created_at: string;
  updated_at: string;
}

interface HealthStats {
  totalAppointments: number;
  upcomingAppointments: number;
  medicalRecords: number;
  activeMedications: number;
  lastCheckup: string | null;
}

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    medicalRecords: 0,
    activeMedications: 0,
    lastCheckup: null,
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHealthStats();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || null,
              notifications_enabled: true,
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
          checkProfileCompleteness(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        checkProfileCompleteness(data);
      }
    } catch (err: any) {
      setError('Failed to load profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchHealthStats() {
    if (!user) return;

    try {
      // Fetch appointments
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('datetime', new Date().toISOString());

      // Fetch medical records
      const { count: medicalRecords } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch medications
      const { count: activeMedications } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch last appointment for checkup date
      const { data: lastAppointment } = await supabase
        .from('appointments')
        .select('datetime')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('datetime', { ascending: false })
        .limit(1)
        .single();

      setHealthStats({
        totalAppointments: totalAppointments || 0,
        upcomingAppointments: upcomingAppointments || 0,
        medicalRecords: medicalRecords || 0,
        activeMedications: activeMedications || 0,
        lastCheckup: lastAppointment?.datetime || null,
      });
    } catch (err) {
      console.warn('Could not fetch health stats:', err);
    }
  }

  function checkProfileCompleteness(profile: UserProfile) {
    const requiredFields = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'phone', label: 'Phone Number' },
    ];

    const missing = requiredFields
      .filter(f => !profile[f.key as keyof UserProfile])
      .map(f => f.label);

    if (missing.length > 0) {
      toast.error(`Profile incomplete: ${missing.join(', ')}`, { duration: 5000 });
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

  const formatDate = (dateStr: string, fallback = 'Invalid date') => {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'MMMM d, yyyy') : fallback;
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    const fields = [profile.full_name, profile.email, profile.phone];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="profile">
        <div className="profile__loading">
          <Loader2 className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile">
        <div className="profile__error">
          <AlertCircle className="error-icon" aria-hidden="true" />
          <h2 className="error-title">Unable to Load Profile</h2>
          <p className="error-message">{error}</p>
          <Button onClick={fetchProfile} className="btn btn--primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="profile__error">
          <AlertCircle className="error-icon" aria-hidden="true" />
          <h2 className="error-title">Profile Not Found</h2>
          <p className="error-message">Unable to load your profile information.</p>
          <Button onClick={fetchProfile} className="btn btn--primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const completionPercentage = getProfileCompletionPercentage();

  return (
    <main className="profile">
      {/* Hero Section */}
      <section className="profile-hero" aria-labelledby="profile-hero-title">
        <div className="profile-hero__background" aria-hidden="true">
          <div className="hero-pattern"></div>
        </div>
        <div className="profile-hero__content">
          <div className="profile-hero__avatar">
            <div className="avatar-circle" role="img" aria-label={`Avatar for ${profile.full_name || 'User'}`}>
              <span className="avatar-initials" aria-hidden="true">{getUserInitials()}</span>
            </div>
            <div className="avatar-status" aria-label="Account verified">
              <CheckCircle className="status-icon" aria-hidden="true" />
            </div>
          </div>
          
          <div className="profile-hero__info">
            <h1 id="profile-hero-title" className="profile-hero__name">{profile.full_name || 'Welcome'}</h1>
            <p className="profile-hero__role">Patient</p>
            <p className="profile-hero__email">{profile.email}</p>
            
            <div className="profile-hero__completion">
              <div className="completion-bar" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion progress">
                <div 
                  className="completion-fill" 
                  style={{ width: `${completionPercentage}%` }}
                  aria-hidden="true"
                ></div>
              </div>
              <span className="completion-text">
                Profile {completionPercentage}% complete
              </span>
            </div>
          </div>
          
          <div className="profile-hero__actions">
            <Link to="/settings#profile" className="btn btn--primary">
              <Edit className="btn__icon" aria-hidden="true" />
              Edit Profile
            </Link>
            <Link to="/settings#security" className="btn btn--secondary">
              <Shield className="btn__icon" aria-hidden="true" />
              Security
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="profile-stats" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Health Statistics Overview</h2>
        <div className="stats-grid">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon" aria-hidden="true">
              <Calendar />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{healthStats.totalAppointments}</h3>
              <p className="stat-card__label">Total Appointments</p>
              <div className="stat-card__trend">
                <TrendingUp className="trend-icon" aria-hidden="true" />
                <span className="trend-text">Healthcare journey</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-card__icon" aria-hidden="true">
              <Clock />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{healthStats.upcomingAppointments}</h3>
              <p className="stat-card__label">Upcoming Appointments</p>
              <div className="stat-card__trend">
                <Activity className="trend-icon" aria-hidden="true" />
                <span className="trend-text">Stay on track</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon" aria-hidden="true">
              <FileText />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{healthStats.medicalRecords}</h3>
              <p className="stat-card__label">Medical Records</p>
              <div className="stat-card__trend">
                <Heart className="trend-icon" aria-hidden="true" />
                <span className="trend-text">Health history</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-card__icon" aria-hidden="true">
              <Pill />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{healthStats.activeMedications}</h3>
              <p className="stat-card__label">Active Medications</p>
              <div className="stat-card__trend">
                <Stethoscope className="trend-icon" aria-hidden="true" />
                <span className="trend-text">Current prescriptions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="profile__content">
        {/* Personal Information Card */}
        <section className="profile-card" aria-labelledby="personal-info-title">
          <div className="profile-card__header">
            <div className="profile-card__title-group">
              <User className="profile-card__icon" aria-hidden="true" />
              <h2 id="personal-info-title" className="profile-card__title">Personal Information</h2>
            </div>
            <Link to="/settings#profile" className="btn btn--primary btn-sm">
              <Edit className="btn__icon" aria-hidden="true" size={12}/>
              Edit
            </Link>
          </div>
          
          <div className="profile-card__body">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <User />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Full Name</span>
                  <span className="info-item__value">
                    {profile.full_name || (
                      <span className="info-item__missing">Not provided</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <Mail />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Email Address</span>
                  <span className="info-item__value">{profile.email}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <Phone />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Phone Number</span>
                  <span className="info-item__value">
                    {profile.phone || (
                      <span className="info-item__missing">Not provided</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <Calendar />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Member Since</span>
                  <span className="info-item__value">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <Bell />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Notifications</span>
                  <span className={`info-item__badge ${profile.notifications_enabled ? 'info-item__badge--success' : 'info-item__badge--warning'}`}>
                    {profile.notifications_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-item__icon" aria-hidden="true">
                  <Activity />
                </div>
                <div className="info-item__content">
                  <span className="info-item__label">Last Updated</span>
                  <span className="info-item__value">
                    {formatDate(profile.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Health Summary Card */}
        <section className="profile-card" aria-labelledby="health-summary-title">
          <div className="profile-card__header">
            <div className="profile-card__title-group">
              <Heart className="profile-card__icon" aria-hidden="true" />
              <h2 id="health-summary-title" className="profile-card__title">Health Summary</h2>
            </div>
            <Link to="/dashboard" className="btn btn--primary  btn-sm">
              View Dashboard
            </Link>
          </div>
          
          <div className="profile-card__body">
            <div className="health-summary">
              <div className="health-item">
                <div className="health-item__icon health-item__icon--primary" aria-hidden="true">
                  <Stethoscope />
                </div>
                <div className="health-item__content">
                  <h3 className="health-item__title">Last Checkup</h3>
                  <p className="health-item__value">
                    {healthStats.lastCheckup 
                      ? format(parseISO(healthStats.lastCheckup), 'MMM d, yyyy')
                      : 'No recent checkups'
                    }
                  </p>
                </div>
              </div>

              <div className="health-item">
                <div className="health-item__icon health-item__icon--success" aria-hidden="true">
                  <Calendar />
                </div>
                <div className="health-item__content">
                  <h3 className="health-item__title">Next Appointment</h3>
                  <p className="health-item__value">
                    {healthStats.upcomingAppointments > 0 
                      ? `${healthStats.upcomingAppointments} scheduled`
                      : 'None scheduled'
                    }
                  </p>
                </div>
              </div>

              <div className="health-item">
                <div className="health-item__icon health-item__icon--warning" aria-hidden="true">
                  <Pill />
                </div>
                <div className="health-item__content">
                  <h3 className="health-item__title">Medications</h3>
                  <p className="health-item__value">
                    {healthStats.activeMedications > 0 
                      ? `${healthStats.activeMedications} active`
                      : 'No active medications'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Card */}
        <section className="profile-card" aria-labelledby="quick-actions-title">
          <div className="profile-card__header">
            <div className="profile-card__title-group">
              <Settings className="profile-card__icon" aria-hidden="true" />
              <h2 id="quick-actions-title" className="profile-card__title">Quick Actions</h2>
            </div>
          </div>
          
          <div className="profile-card__body">
            <nav className="quick-actions" aria-label="Quick actions navigation">
              <Link to="/settings#profile" className="quick-action">
                <div className="quick-action__icon quick-action__icon--primary" aria-hidden="true">
                  <Edit />
                </div>
                <div className="quick-action__content">
                  <h3 className="quick-action__title">Edit Profile</h3>
                  <p className="quick-action__description">Update your personal information</p>
                </div>
              </Link>

              <Link to="/settings#security" className="quick-action">
                <div className="quick-action__icon quick-action__icon--success" aria-hidden="true">
                  <Shield />
                </div>
                <div className="quick-action__content">
                  <h3 className="quick-action__title">Privacy & Security</h3>
                  <p className="quick-action__description">Manage your account security</p>
                </div>
              </Link>

              <Link to="/settings#password" className="quick-action">
                <div className="quick-action__icon quick-action__icon--warning" aria-hidden="true">
                  <Key />
                </div>
                <div className="quick-action__content">
                  <h3 className="quick-action__title">Change Password</h3>
                  <p className="quick-action__description">Update your account password</p>
                </div>
              </Link>

              <Link to="/appointments" className="quick-action">
                <div className="quick-action__icon quick-action__icon--info" aria-hidden="true">
                  <Calendar />
                </div>
                <div className="quick-action__content">
                  <h3 className="quick-action__title">Book Appointment</h3>
                  <p className="quick-action__description">Schedule a new appointment</p>
                </div>
              </Link>
            </nav>
          </div>
        </section>

        {/* Account Status Card */}
        <section className="profile-card" aria-labelledby="account-status-title">
          <div className="profile-card__header">
            <div className="profile-card__title-group">
              <Award className="profile-card__icon" aria-hidden="true" />
              <h2 id="account-status-title" className="profile-card__title">Account Status</h2>
            </div>
          </div>
          
          <div className="profile-card__body">
            <div className="account-status">
              <div className="status-item">
                <div className="status-item__indicator status-item__indicator--success" aria-hidden="true"></div>
                <div className="status-item__content">
                  <h3 className="status-item__title">Account Verified</h3>
                  <p className="status-item__description">Your email address has been verified</p>
                </div>
              </div>

              <div className="status-item">
                <div className={`status-item__indicator ${completionPercentage === 100 ? 'status-item__indicator--success' : 'status-item__indicator--warning'}`} aria-hidden="true"></div>
                <div className="status-item__content">
                  <h3 className="status-item__title">Profile Completion</h3>
                  <p className="status-item__description">
                    {completionPercentage === 100 
                      ? 'Your profile is complete' 
                      : `${completionPercentage}% complete - add missing information`
                    }
                  </p>
                </div>
              </div>

              <div className="status-item">
                <div className={`status-item__indicator ${profile.notifications_enabled ? 'status-item__indicator--success' : 'status-item__indicator--warning'}`} aria-hidden="true"></div>
                <div className="status-item__content">
                  <h3 className="status-item__title">Notifications</h3>
                  <p className="status-item__description">
                    {profile.notifications_enabled 
                      ? 'You will receive important updates' 
                      : 'Enable notifications to stay informed'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}