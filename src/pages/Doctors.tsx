import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  StarHalf, 
  Calendar, 
  Award, 
  Users, 
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Activity,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

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
  working_hours?: {
    start: string;
    end: string;
  };
}

export default function Doctors() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'name'>('rating');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchDoctors();
  }, [user]);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  async function fetchDoctors() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;

      setDoctors(data || []);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortDoctors() {
    let filtered = [...doctors];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search) ||
        doctor.location.toLowerCase().includes(search)
      );
    }

    // Apply specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.rating - a.rating;
      }
    });

    setFilteredDoctors(filtered);
  }

  const renderStars = (rating: number) => {
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

  const getSpecialtyIcon = (specialty: string) => {
    const spec = specialty.toLowerCase();
    if (spec.includes('cardio')) return <Heart className="specialty-icon" aria-hidden="true" />;
    if (spec.includes('neuro')) return <Brain className="specialty-icon" aria-hidden="true" />;
    if (spec.includes('ophthal') || spec.includes('eye')) return <Eye className="specialty-icon" aria-hidden="true" />;
    if (spec.includes('orthop') || spec.includes('bone')) return <Bone className="specialty-icon" aria-hidden="true" />;
    if (spec.includes('pediatr') || spec.includes('child')) return <Baby className="specialty-icon" aria-hidden="true" />;
    if (spec.includes('general') || spec.includes('family')) return <Activity className="specialty-icon" aria-hidden="true" />;
    return <Stethoscope className="specialty-icon" aria-hidden="true" />;
  };

  const getUniqueSpecialties = () => {
    const specialties = doctors.map(doctor => doctor.specialty);
    return [...new Set(specialties)].sort();
  };

  const getDoctorStats = () => {
    const totalDoctors = doctors.length;
    const avgRating = doctors.length > 0 
      ? doctors.reduce((sum, doctor) => sum + doctor.rating, 0) / doctors.length 
      : 0;
    const specialtyCount = getUniqueSpecialties().length;
    const avgExperience = doctors.length > 0
      ? doctors.reduce((sum, doctor) => sum + doctor.experience, 0) / doctors.length
      : 0;

    return { totalDoctors, avgRating, specialtyCount, avgExperience };
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="doctors-page">
        <div className="doctors-page__loading">
          <Loader2 className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">Finding the best doctors for you...</span>
        </div>
      </div>
    );
  }

  const stats = getDoctorStats();
  const uniqueSpecialties = getUniqueSpecialties();

  return (
    <main className="doctors-page">
      <div className="doctors-page__container">
        {/* Header */}
        <header className="doctors-page__header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Find Your Doctor</h1>
              <p className="header-subtitle">
                Connect with qualified healthcare professionals in your area
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <Users className="stat-badge__icon" aria-hidden="true" />
                <span className="stat-badge__count">{stats.totalDoctors}</span>
                <span className="stat-badge__label">Doctors</span>
              </div>
              <div className="stat-badge stat-badge--specialty">
                <Award className="stat-badge__icon" aria-hidden="true" />
                <span className="stat-badge__count">{stats.specialtyCount}</span>
                <span className="stat-badge__label">Specialties</span>
              </div>
              {stats.avgRating > 0 && (
                <div className="stat-badge stat-badge--rating">
                  <Star className="stat-badge__icon" aria-hidden="true" />
                  <span className="stat-badge__count">{stats.avgRating.toFixed(1)}</span>
                  <span className="stat-badge__label">Avg Rating</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Quick Stats Overview */}
        {doctors.length > 0 && (
          <section className="doctors-overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">Healthcare Network Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-card__icon overview-card__icon--primary">
                  <Stethoscope />
                </div>
                <div className="overview-card__content">
                  <span className="overview-card__count">{stats.totalDoctors}</span>
                  <span className="overview-card__label">Healthcare Providers</span>
                  <span className="overview-card__description">Qualified professionals ready to help</span>
                </div>
              </div>

              <div className="overview-card">
                <div className="overview-card__icon overview-card__icon--success">
                  <Award />
                </div>
                <div className="overview-card__content">
                  <span className="overview-card__count">{Math.round(stats.avgExperience)}</span>
                  <span className="overview-card__label">Years Experience</span>
                  <span className="overview-card__description">Average professional experience</span>
                </div>
              </div>

              <div className="overview-card">
                <div className="overview-card__icon overview-card__icon--warning">
                  <Activity />
                </div>
                <div className="overview-card__content">
                  <span className="overview-card__count">{stats.specialtyCount}</span>
                  <span className="overview-card__label">Medical Specialties</span>
                  <span className="overview-card__description">Comprehensive healthcare coverage</span>
                </div>
              </div>

              <div className="overview-card">
                <div className="overview-card__icon overview-card__icon--info">
                  <Star />
                </div>
                <div className="overview-card__content">
                  <span className="overview-card__count">{stats.avgRating.toFixed(1)}</span>
                  <span className="overview-card__label">Patient Rating</span>
                  <span className="overview-card__description">Average satisfaction score</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="doctors-page__controls" aria-label="Search and filter controls">
          <div className="controls-card">
            <div className="search-section">
              <div className="search-group">
                <label htmlFor="search-input" className="sr-only">Search doctors</label>
                <div className="search-input-wrapper">
                  <Search className="search-icon" aria-hidden="true" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by name, specialty, or location..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-group">
                  <label htmlFor="specialty-filter" className="filter-label">
                    <Filter className="filter-label__icon" aria-hidden="true" />
                    Specialty:
                  </label>
                  <select
                    id="specialty-filter"
                    className="filter-select"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="all">All Specialties</option>
                    {uniqueSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sort-filter" className="filter-label">
                    Sort by:
                  </label>
                  <select
                    id="sort-filter"
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'experience' | 'name')}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            <AlertCircle className="error-message__icon" aria-hidden="true" />
            <div className="error-message__content">
              <h2 className="error-message__title">Error Loading Doctors</h2>
              <p className="error-message__text">{error}</p>
              <button 
                onClick={fetchDoctors}
                className="error-message__retry"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Doctors Content */}
        <section className="doctors-page__content" aria-label="Doctors list">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <Stethoscope className="empty-state__icon" aria-hidden="true" />
              <h2 className="empty-state__title">
                {searchTerm || selectedSpecialty !== 'all' ? 'No Matching Doctors Found' : 'No Doctors Available'}
              </h2>
              <p className="empty-state__message">
                {searchTerm || selectedSpecialty !== 'all'
                  ? 'Try adjusting your search terms or filters to find the right healthcare provider.'
                  : 'We\'re working to add more healthcare providers to our network.'
                }
              </p>
              {(searchTerm || selectedSpecialty !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('all');
                  }}
                  className="empty-state__action"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="results-summary">
                <p className="results-text">
                  Showing <strong>{filteredDoctors.length}</strong> of <strong>{doctors.length}</strong> doctors
                  {(searchTerm || selectedSpecialty !== 'all') && (
                    <span className="search-indicator">
                      {searchTerm && ` matching "${searchTerm}"`}
                      {selectedSpecialty !== 'all' && ` in ${selectedSpecialty}`}
                    </span>
                  )}
                </p>
                {(searchTerm || selectedSpecialty !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('all');
                    }}
                    className="clear-filters-btn"
                    aria-label="Clear all filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Doctors Grid */}
              <div className="doctors-grid">
                {filteredDoctors.map((doctor) => (
                  <article 
                    key={doctor.id} 
                    className="doctor-card"
                    aria-labelledby={`doctor-name-${doctor.id}`}
                  >
                    {/* Doctor Header */}
                    <header className="doctor-card__header">
                      <div className="doctor-avatar">
                        {doctor.profile_image_url ? (
                          <img
                            src={doctor.profile_image_url}
                            alt={`Dr. ${doctor.name}`}
                            className="doctor-avatar__image"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              (e.currentTarget as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`doctor-avatar__placeholder ${doctor.profile_image_url ? 'hidden' : ''}`}>
                          <Stethoscope className="doctor-avatar__icon" aria-hidden="true" />
                        </div>
                      </div>
                      
                      <div className="doctor-info">
                        <h3 id={`doctor-name-${doctor.id}`} className="doctor-name">
                          {doctor.name}
                        </h3>
                        <div className="doctor-specialty">
                          {getSpecialtyIcon(doctor.specialty)}
                          <span className="doctor-specialty__text">{doctor.specialty}</span>
                        </div>
                        
                        {doctor.rating > 0 && (
                          <div className="doctor-rating">
                            <div className="doctor-rating__stars" aria-label={`Rating: ${doctor.rating} out of 5 stars`}>
                              {renderStars(doctor.rating)}
                            </div>
                            <span className="doctor-rating__text">
                              {doctor.rating.toFixed(1)} ({doctor.review_count} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </header>

                    {/* Doctor Body */}
                    <div className="doctor-card__body">
                      <div className="doctor-details">
                        <div className="detail-item">
                          <MapPin className="detail-item__icon" aria-hidden="true" />
                          <span className="detail-item__text">{doctor.location}</span>
                        </div>
                        
                        <div className="detail-item">
                          <Award className="detail-item__icon" aria-hidden="true" />
                          <span className="detail-item__text">{doctor.experience} years experience</span>
                        </div>
                        
                        <div className="detail-item">
                          <DollarSign className="detail-item__icon" aria-hidden="true" />
                          <span className="detail-item__text">From ${doctor.consultation_fee}</span>
                        </div>
                        
                        <div className="detail-item">
                          <Clock className="detail-item__icon" aria-hidden="true" />
                          <span className="detail-item__text">
                            Available {doctor.available_days.length} days/week
                          </span>
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="doctor-bio">{doctor.bio}</p>
                      )}

                      {doctor.languages.length > 0 && (
                        <div className="doctor-languages">
                          <span className="doctor-languages__label">Languages:</span>
                          <div className="doctor-languages__list">
                            {doctor.languages.slice(0, 3).map((language, index) => (
                              <span key={index} className="language-tag">
                                {language}
                              </span>
                            ))}
                            {doctor.languages.length > 3 && (
                              <span className="language-tag language-tag--more">
                                +{doctor.languages.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Doctor Actions */}
                    <footer className="doctor-card__footer">
                      <Link 
                        to={`/doctors/${doctor.id}`} 
                        className="doctor-action-link"
                        aria-label={`View profile of Dr. ${doctor.name}`}
                      >
                        <button className="doctor-btn doctor-btn--primary">
                          View Profile
                          <ChevronRight className="doctor-btn__icon" aria-hidden="true" />
                        </button>
                      </Link>
                      
                      <Link 
                        to={`/appointments/book?doctor=${doctor.id}`} 
                        className="doctor-action-link"
                        aria-label={`Book appointment with Dr. ${doctor.name}`}
                      >
                        <button className="doctor-btn doctor-btn--secondary">
                          <Calendar className="doctor-btn__icon" aria-hidden="true" />
                          Book Now
                        </button>
                      </Link>
                    </footer>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}