import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Phone, 
  ArrowLeft,
  Stethoscope,
  Star,
  StarHalf,
  ShieldPlus,
  CheckCircle,
  Mail,
  MapPin,
  Clock,
  Award,
  DollarSign,
  MessageCircle,
  ChevronRight,
  Globe,
  GraduationCap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { format } from 'date-fns';


interface WorkingHours {
  start: string; 
  end: string;   
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  education: string[];
  experience: number;
  languages: string[];
  rating: number;
  review_count: number;
  available_days: string[];
  consultation_fee: number;
  profile_image_url?: string;
  working_hours?: WorkingHours;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Data fetching
  useEffect(() => {
    if (!id || !user) return;
    fetchDoctorData();
  }, [id, user]);

  async function fetchDoctorData() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (doctorError) throw doctorError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('doctor_reviews')
        .select('*')
        .eq('doctor_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      setDoctor(doctorData);
      setReviews(reviewsData || []);
    } catch (err: any) {
      console.error('Error fetching doctor data:', err);
      setError('Failed to load doctor profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const handleBookAppointment = () => {
    navigate(`/appointments/book?doctor=${id}`);
  };

  const handleRetry = () => {
    fetchDoctorData();
  };

  // Helper function to format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    try {
      return format(new Date(`1970-01-01T${timeStr}:00`), 'h:mm a');
    } catch {
      return null;
    }
  };

  // Helper function to render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i + 1 <= Math.floor(rating);
      const isHalf = i + 0.5 <= rating && i + 1 > rating;

      return (
        <span key={i} className="star-wrapper">
          {isFilled ? (
            <Star className="star star--filled" aria-hidden="true" />
          ) : isHalf ? (
            <StarHalf className="star star--half" aria-hidden="true" />
          ) : (
            <Star className="star star--empty" aria-hidden="true" />
          )}
        </span>
      );
    });
  };

  // Loading Spinner Component
  const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
    <div className="doctor-profile__loading">
      <Loader2 className="loading-spinner" aria-hidden="true" />
      <span className="loading-text">{text}</span>
    </div>
  );

  // Error Message Component
  const ErrorMessage = ({ 
    title = 'Error', 
    message, 
    showBackButton = true 
  }: { 
    title?: string; 
    message: string; 
    showBackButton?: boolean; 
  }) => (
    <div className="doctor-profile__error">
      <AlertCircle className="error-icon" aria-hidden="true" />
      <div className="error-content">
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          {showBackButton && (
            <Link to="/doctors" className="error-back-btn">
              <ArrowLeft className="error-back-icon" aria-hidden="true" />
              Back to Doctors
            </Link>
          )}
          <button onClick={handleRetry} className="error-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Doctor Avatar Component
  const DoctorAvatar = ({ 
    imageUrl, 
    name, 
    showVerification = false 
  }: { 
    imageUrl?: string; 
    name: string; 
    showVerification?: boolean; 
  }) => (
    <div className="doctor-avatar-section">
      <div className="doctor-avatar-large">
        {imageUrl && imageUrl.trim() !== "" ? (
          <img
            src={imageUrl}
            alt={`Dr. ${name}`}
            className="doctor-avatar-large__image"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`doctor-avatar-large__placeholder ${imageUrl ? 'hidden' : ''}`}>
          <ShieldPlus className="doctor-avatar-large__icon" aria-hidden="true" />
        </div>
      </div>
      {showVerification && (
        <div className="verification-badge" aria-label="Verified healthcare provider">
          <CheckCircle className="verification-icon" aria-hidden="true" />
          <span className="verification-text">Verified</span>
        </div>
      )}
    </div>
  );

  // Doctor Stats Component
  const DoctorStats = ({ 
    experience, 
    consultationFee, 
    availableDaysCount 
  }: { 
    experience: number; 
    consultationFee: number; 
    availableDaysCount: number; 
  }) => (
    <div className="doctor-hero-stats">
      <div className="hero-stat">
        <span className="hero-stat__value">{experience}</span>
        <span className="hero-stat__label">Years Experience</span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat__value">${consultationFee}</span>
        <span className="hero-stat__label">Consultation Fee</span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat__value">{availableDaysCount}</span>
        <span className="hero-stat__label">Days Available</span>
      </div>
    </div>
  );

  // Contact Info Component
  const ContactInfo = ({ 
    location, 
    phone, 
    email, 
    availableDays, 
    doctorName 
  }: { 
    location: string; 
    phone: string; 
    email: string; 
    availableDays: string[]; 
    doctorName: string; 
  }) => (
    <div className="contact-details">
      <div className="contact-item">
        <MapPin className="contact-item__icon" aria-hidden="true" />
        <div className="contact-item__content">
          <span className="contact-item__label">Location</span>
          <span className="contact-item__value">{location}</span>
        </div>
      </div>
      
      <div className="contact-item">
        <Phone className="contact-item__icon" aria-hidden="true" />
        <div className="contact-item__content">
          <span className="contact-item__label">Phone</span>
          <a 
            href={`tel:${phone}`} 
            className="contact-item__value contact-item__value--link"
            aria-label={`Call ${phone}`}
          >
            {phone}
          </a>
        </div>
      </div>
      
      <div className="contact-item">
        <Mail className="contact-item__icon" aria-hidden="true" />
        <div className="contact-item__content">
          <span className="contact-item__label">Email</span>
          <a 
            href={`mailto:${email}`} 
            className="contact-item__value contact-item__value--link"
            aria-label={`Email Dr. ${doctorName} at ${email}`}
          >
            {email}
          </a>
        </div>
      </div>
      
      <div className="contact-item">
        <Clock className="contact-item__icon" aria-hidden="true" />
        <div className="contact-item__content">
          <span className="contact-item__label">Available Days</span>
          <span className="contact-item__value">{availableDays.join(', ')}</span>
        </div>
      </div>
    </div>
  );

  // Quick Actions Component
  const QuickActions = ({ 
    onBookAppointment, 
    phone, 
    email, 
    doctorName 
  }: { 
    onBookAppointment: () => void; 
    phone: string; 
    email: string; 
    doctorName: string; 
  }) => (
    <nav className="quick-actions" aria-label="Quick actions">
      <button 
        onClick={onBookAppointment}
        className="quick-action"
        aria-label={`Book appointment with Dr. ${doctorName}`}
      >
        <div className="quick-action__icon quick-action__icon--primary">
          <Calendar />
        </div>
        <div className="quick-action__content">
          <h3 className="quick-action__title">Book Appointment</h3>
          <p className="quick-action__description">Schedule your visit</p>
        </div>
        <ChevronRight className="quick-action__arrow" aria-hidden="true" />
      </button>
      
      <a 
        href={`tel:${phone}`}
        className="quick-action"
        aria-label={`Call Dr. ${doctorName}`}
      >
        <div className="quick-action__icon quick-action__icon--success">
          <Phone />
        </div>
        <div className="quick-action__content">
          <h3 className="quick-action__title">Call Doctor</h3>
          <p className="quick-action__description">Direct phone contact</p>
        </div>
        <ChevronRight className="quick-action__arrow" aria-hidden="true" />
      </a>
      
      <a 
        href={`mailto:${email}`}
        className="quick-action"
        aria-label={`Email Dr. ${doctorName}`}
      >
        <div className="quick-action__icon quick-action__icon--info">
          <MessageCircle />
        </div>
        <div className="quick-action__content">
          <h3 className="quick-action__title">Send Message</h3>
          <p className="quick-action__description">Email communication</p>
        </div>
        <ChevronRight className="quick-action__arrow" aria-hidden="true" />
      </a>
    </nav>
  );

  // Availability Schedule Component
  const AvailabilitySchedule = ({ 
    availableDays, 
    workingHours 
  }: { 
    availableDays: string[]; 
    workingHours?: WorkingHours; 
  }) => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="availability-info">
        <div className="availability-grid">
          {weekDays.map((day) => (
            <div
              key={day}
              className={`availability-day ${
                availableDays.includes(day)
                  ? 'availability-day--available'
                  : 'availability-day--unavailable'
              }`}
              aria-label={`${day}: ${availableDays.includes(day) ? 'Available' : 'Unavailable'}`}
            >
              <span className="availability-day__name">{day.slice(0, 3)}</span>
              <span className="availability-day__status">
                {availableDays.includes(day) ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>
        
        {workingHours && workingHours.start && workingHours.end && (
          <div className="working-hours">
            <Clock className="working-hours__icon" aria-hidden="true" />
            <div className="working-hours__content">
              <span className="working-hours__label">Working Hours</span>
              <span className="working-hours__time">
                {formatTime(workingHours.start)} - {formatTime(workingHours.end)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Education Timeline Component
  const EducationTimeline = ({ education }: { education: string[] }) => (
    <div className="info-block">
      <h3 className="info-block__title">
        <GraduationCap className="info-block__icon" aria-hidden="true" />
        Education
      </h3>
      <ul className="education-timeline">
        {education.map((edu, index) => (
          <li key={index} className="education-timeline__item">
            <div className="education-timeline__marker" aria-hidden="true"></div>
            <span className="education-timeline__text">{edu}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // Language Tags Component
  const LanguageTags = ({ languages }: { languages: string[] }) => (
    <div className="info-block">
      <h3 className="info-block__title">
        <Globe className="info-block__icon" aria-hidden="true" />
        Languages
      </h3>
      <div className="language-tags">
        {languages.map((lang, index) => (
          <span key={index} className="language-tag">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );

  // Reviews List Component
  const ReviewsList = ({ 
    reviews, 
    showAllButton = false 
  }: { 
    reviews: Review[]; 
    showAllButton?: boolean; 
  }) => {
    if (reviews.length === 0) {
      return (
        <div className="empty-reviews">
          <Star className="empty-reviews__icon" aria-hidden="true" />
          <h3 className="empty-reviews__title">No Reviews Yet</h3>
          <p className="empty-reviews__text">
            Be the first to leave a review after your appointment
          </p>
        </div>
      );
    }

    return (
      <div className="reviews-list">
        {reviews.map((review) => (
          <article key={review.id} className="review-card">
            <header className="review-card__header">
              <div className="review-avatar">
                <span className="review-avatar__initial">
                  {review.user_name[0].toUpperCase()}
                </span>
              </div>
              <div className="review-info">
                <h4 className="review-info__name">{review.user_name}</h4>
                <p className="review-info__date">
                  {format(new Date(review.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="review-rating">
                <div className="review-rating__stars">
                  {renderStars(review.rating, 'sm')}
                </div>
                <span className="review-rating__score">{review.rating.toFixed(1)}</span>
              </div>
            </header>
            <p className="review-card__comment">{review.comment}</p>
          </article>
        ))}
      </div>
    );
  };

  // Early returns for authentication, loading, and error states
  if (!user) {
    return null; 
  }

  if (loading) {
    return (
      <div className="doctor-profile">
        <LoadingSpinner text="Loading doctor profile..." />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-profile">
        <ErrorMessage
          title="Unable to Load Profile"
          message={error || 'Doctor not found'}
        />
      </div>
    );
  }

  // Main render
  return (
    <main className="doctor-profile">
      <div className="doctor-profile__container">
        {/* Navigation */}
        <nav className="doctor-profile__navigation" aria-label="Breadcrumb navigation">
          <Link to="/doctors" className="back-link">
            <ArrowLeft className="back-icon" aria-hidden="true" />
            Back to Doctors
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="doctor-profile__hero" aria-labelledby="doctor-hero-title">
          <div className="hero-background" aria-hidden="true">
            <div className="hero-pattern"></div>
          </div>
          <div className="hero-content">
            <DoctorAvatar
              imageUrl={doctor.profile_image_url}
              name={doctor.name}
              showVerification
            />
            
            <div className="doctor-hero-info">
              <h1 id="doctor-hero-title" className="doctor-hero-name">{doctor.name}</h1>
              <p className="doctor-hero-specialty">{doctor.specialty}</p>
              
              {doctor.rating > 0 && (
                <div className="doctor-hero-rating">
                  <div className="doctor-hero-rating__stars">
                    {renderStars(doctor.rating, 'lg')}
                  </div>
                  <div className="doctor-hero-rating__text">
                    <span className="rating-score">{doctor.rating.toFixed(1)}</span>
                    <span className="rating-reviews">({doctor.review_count} reviews)</span>
                  </div>
                </div>
              )}
              
              <DoctorStats
                experience={doctor.experience}
                consultationFee={doctor.consultation_fee}
                availableDaysCount={doctor.available_days.length}
              />
              
              <div className="doctor-hero-actions">
                <button 
                  onClick={handleBookAppointment} 
                  className="hero-btn hero-btn--primary"
                  aria-label={`Book appointment with Dr. ${doctor.name}`}
                >
                  <Calendar className="hero-btn__icon" aria-hidden="true" />
                  Book Appointment
                </button>
                <a 
                  href={`tel:${doctor.phone}`} 
                  className="hero-btn hero-btn--secondary"
                  aria-label={`Call Dr. ${doctor.name} at ${doctor.phone}`}
                >
                  <Phone className="hero-btn__icon" aria-hidden="true" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="doctor-profile__content">
          {/* Sidebar */}
          <aside className="doctor-profile__sidebar">
            {/* Contact Information */}
            <section className="profile-card" aria-labelledby="contact-title">
              <header className="profile-card__header">
                <h2 id="contact-title" className="profile-card__title">
                  <Phone className="profile-card__icon" aria-hidden="true" />
                  Contact Information
                </h2>
              </header>
              <div className="profile-card__body">
                <ContactInfo
                  location={doctor.location}
                  phone={doctor.phone}
                  email={doctor.email}
                  availableDays={doctor.available_days}
                  doctorName={doctor.name}
                />
              </div>
            </section>

            {/* Quick Actions */}
            <section className="profile-card" aria-labelledby="actions-title">
              <header className="profile-card__header">
                <h2 id="actions-title" className="profile-card__title">
                  <Stethoscope className="profile-card__icon" aria-hidden="true" />
                  Quick Actions
                </h2>
              </header>
              <div className="profile-card__body">
                <QuickActions
                  onBookAppointment={handleBookAppointment}
                  phone={doctor.phone}
                  email={doctor.email}
                  doctorName={doctor.name}
                />
              </div>
            </section>
          </aside>

          {/* Main Content */}
          <main className="doctor-profile__main">
            {/* About Section */}
            <section className="content-section" aria-labelledby="about-title">
              <header className="content-section__header">
                <h2 id="about-title" className="content-section__title">
                  <Stethoscope className="content-section__icon" aria-hidden="true" />
                  About {doctor.name}
                </h2>
              </header>
              <div className="content-section__body">
                <p className="doctor-bio">{doctor.bio}</p>

                <div className="info-grid">
                  <EducationTimeline education={doctor.education} />
                  <LanguageTags languages={doctor.languages} />
                </div>
              </div>
            </section>

            {/* Availability Section */}
            <section className="content-section" aria-labelledby="availability-title">
              <header className="content-section__header">
                <h2 id="availability-title" className="content-section__title">
                  <Calendar className="content-section__icon" aria-hidden="true" />
                  Availability
                </h2>
              </header>
              <div className="content-section__body">
                <AvailabilitySchedule
                  availableDays={doctor.available_days}
                  workingHours={doctor.working_hours}
                />
              </div>
            </section>

            {/* Reviews Section */}
            <section className="content-section" aria-labelledby="reviews-title">
              <header className="content-section__header">
                <h2 id="reviews-title" className="content-section__title">
                  <Star className="content-section__icon" aria-hidden="true" />
                  Patient Reviews
                </h2>
                {reviews.length > 5 && (
                  <button className="content-section__action">
                    See All Reviews
                    <ChevronRight className="content-section__action-icon" aria-hidden="true" />
                  </button>
                )}
              </header>
              <div className="content-section__body">
                <ReviewsList
                  reviews={reviews}
                  showAllButton={reviews.length > 5}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </main>
  );
}