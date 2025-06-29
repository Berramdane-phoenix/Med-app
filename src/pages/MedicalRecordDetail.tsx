import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Download, 
  Edit, 
  Trash2,
  Loader2,
  AlertCircle,
  Stethoscope,
  Pill,
  Activity,
  Eye,
  Heart,
  Clock,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { format, parseISO, isValid } from 'date-fns';

interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  doctor_name: string;
  document_url?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  follow_up_date?: string;
}

export default function MedicalRecordDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !id) return;

    async function fetchRecord() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('id', id)
          .eq('user_id', user?.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Medical record not found');
          } else {
            throw error;
          }
        } else {
          setRecord(data);
        }
      } catch (err: any) {
        console.error('Error fetching medical record:', err);
        setError('Failed to load medical record: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [user, id]);

  const handleDelete = async () => {
    if (!record || !user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this medical record? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (error) throw error;

      navigate('/medical-records', { 
        state: { message: 'Medical record deleted successfully' }
      });
    } catch (err: any) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const getRecordTypeClass = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return 'detail-card--lab';
    if (t.includes('prescription') || t.includes('medication')) return 'detail-card--prescription';
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return 'detail-card--imaging';
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return 'detail-card--visit';
    return 'detail-card--general';
  };

  const getRecordIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return <Activity className="detail-type-icon" aria-hidden="true" />;
    if (t.includes('prescription') || t.includes('medication')) return <Pill className="detail-type-icon" aria-hidden="true" />;
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return <Eye className="detail-type-icon" aria-hidden="true" />;
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return <Stethoscope className="detail-type-icon" aria-hidden="true" />;
    return <FileText className="detail-type-icon" aria-hidden="true" />;
  };

  const getRecordTypeName = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return 'Lab Result';
    if (t.includes('prescription') || t.includes('medication')) return 'Prescription';
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return 'Imaging Study';
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return 'Medical Visit';
    return 'Medical Record';
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'EEEE, MMMM d, yyyy') : 'Invalid date';
  };

  const formatDateTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'MMM d, yyyy h:mm a') : 'Invalid date';
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="medical-record-detail">
        <div className="medical-record-detail__loading">
          <Loader2 className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">Loading medical record...</span>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="medical-record-detail">
        <div className="medical-record-detail__error">
          <AlertCircle className="error-icon" aria-hidden="true" />
          <h2 className="error-title">Unable to Load Record</h2>
          <p className="error-message">{error || 'Medical record not found'}</p>
          <Link to="/medical-records" className="error-back-btn">
            <ArrowLeft className="error-back-icon" aria-hidden="true" />
            Back to Medical Records
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="medical-record-detail">
      <div className="medical-record-detail__container">
        {/* Navigation */}
        <nav className="detail-navigation" aria-label="Breadcrumb navigation">
          <Link to="/medical-records" className="back-link">
            <ArrowLeft className="back-icon" aria-hidden="true" />
            Back to Medical Records
          </Link>
        </nav>

        {/* Header */}
        <header className="detail-header">
          <div className="header-content">
            <div className="header-info">
              <div className="record-type-indicator">
                {getRecordIcon(record.title)}
                <span className="record-type-text">{getRecordTypeName(record.title)}</span>
              </div>
              <h1 className="detail-title">{record.title}</h1>
              <div className="detail-meta">
                <div className="meta-item">
                  <Calendar className="meta-icon" aria-hidden="true" />
                  <time dateTime={record.date} className="meta-text">
                    {formatDate(record.date)}
                  </time>
                </div>
                <div className="meta-item">
                  <User className="meta-icon" aria-hidden="true" />
                  <span className="meta-text">{record.doctor_name}</span>
                </div>
              </div>
            </div>
            
            <div className="header-actions">
              {record.document_url && (
                <a
                  href={record.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-action-link"
                  aria-label={`Download document for ${record.title}`}
                >
                  <button className="detail-btn detail-btn--secondary">
                    <Download className="detail-btn__icon" aria-hidden="true" />
                    Download
                  </button>
                </a>
              )}
              
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="detail-btn detail-btn--danger"
                aria-label={`Delete ${record.title}`}
              >
                {deleting ? (
                  <>
                    <Loader2 className="detail-btn__icon detail-btn__icon--spinning" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="detail-btn__icon" aria-hidden="true" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="detail-content">
          {/* Main Information Card */}
          <section className={`detail-card ${getRecordTypeClass(record.title)}`} aria-labelledby="main-info-title">
            <div className="detail-card__header">
              <h2 id="main-info-title" className="detail-card__title">
                <FileText className="detail-card__icon" aria-hidden="true" />
                Record Information
              </h2>
            </div>
            
            <div className="detail-card__body">
              {record.description && (
                <div className="info-section">
                  <h3 className="info-section__title">Description</h3>
                  <p className="info-section__content">{record.description}</p>
                </div>
              )}

              {record.diagnosis && (
                <div className="info-section">
                  <h3 className="info-section__title">Diagnosis</h3>
                  <p className="info-section__content">{record.diagnosis}</p>
                </div>
              )}

              {record.treatment && (
                <div className="info-section">
                  <h3 className="info-section__title">Treatment</h3>
                  <p className="info-section__content">{record.treatment}</p>
                </div>
              )}

              {record.notes && (
                <div className="info-section">
                  <h3 className="info-section__title">Additional Notes</h3>
                  <p className="info-section__content">{record.notes}</p>
                </div>
              )}

              {record.follow_up_date && (
                <div className="info-section">
                  <h3 className="info-section__title">Follow-up Date</h3>
                  <div className="follow-up-date">
                    <Calendar className="follow-up-icon" aria-hidden="true" />
                    <time dateTime={record.follow_up_date} className="follow-up-text">
                      {formatDate(record.follow_up_date)}
                    </time>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Record Details Card */}
          <section className="detail-card" aria-labelledby="record-details-title">
            <div className="detail-card__header">
              <h2 id="record-details-title" className="detail-card__title">
                <Clock className="detail-card__icon" aria-hidden="true" />
                Record Details
              </h2>
            </div>
            
            <div className="detail-card__body">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Record Date</span>
                  <time dateTime={record.date} className="detail-value">
                    {formatDate(record.date)}
                  </time>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Healthcare Provider</span>
                  <span className="detail-value">{record.doctor_name}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Record Type</span>
                  <span className="detail-value">{getRecordTypeName(record.title)}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <time dateTime={record.created_at} className="detail-value">
                    {formatDateTime(record.created_at)}
                  </time>
                </div>

                {record.updated_at && record.updated_at !== record.created_at && (
                  <div className="detail-item">
                    <span className="detail-label">Last Updated</span>
                    <time dateTime={record.updated_at} className="detail-value">
                      {formatDateTime(record.updated_at)}
                    </time>
                  </div>
                )}

                {record.document_url && (
                  <div className="detail-item detail-item--full">
                    <span className="detail-label">Document</span>
                    <a
                      href={record.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                      aria-label={`View document for ${record.title}`}
                    >
                      <FileText className="document-icon" aria-hidden="true" />
                      View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions Card */}
          <section className="detail-card" aria-labelledby="quick-actions-title">
            <div className="detail-card__header">
              <h2 id="quick-actions-title" className="detail-card__title">
                <Heart className="detail-card__icon" aria-hidden="true" />
                Quick Actions
              </h2>
            </div>
            
            <div className="detail-card__body">
              <div className="quick-actions">
                <Link to="/medical-records" className="quick-action">
                  <div className="quick-action__icon quick-action__icon--primary">
                    <FileText />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">View All Records</h3>
                    <p className="quick-action__description">Browse your complete medical history</p>
                  </div>
                </Link>

                <Link to="/appointments/book" className="quick-action">
                  <div className="quick-action__icon quick-action__icon--success">
                    <Calendar />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">Book Appointment</h3>
                    <p className="quick-action__description">Schedule a follow-up visit</p>
                  </div>
                </Link>

                <Link to="/dashboard" className="quick-action">
                  <div className="quick-action__icon quick-action__icon--info">
                    <Activity />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">Health Dashboard</h3>
                    <p className="quick-action__description">View your health overview</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}