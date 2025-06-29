import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  User, 
  Download, 
  Eye, 
  Loader2,
  AlertCircle,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  TrendingUp
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
}

export default function MedicalRecords() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'doctor'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    async function fetchRecords() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false });

        if (error) throw error;

        setRecords(data || []);
      } catch (err: any) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, [user]);

  // Filter and sort records
  useEffect(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(search) ||
        record.description.toLowerCase().includes(search) ||
        record.doctor_name.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'doctor':
          aValue = a.doctor_name.toLowerCase();
          bValue = b.doctor_name.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRecords(filtered);
  }, [records, searchTerm, sortBy, sortOrder]);

  const getRecordTypeClass = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return 'record-card--lab';
    if (t.includes('prescription') || t.includes('medication')) return 'record-card--prescription';
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return 'record-card--imaging';
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return 'record-card--visit';
    return 'record-card--general';
  };

  const getRecordIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return <Activity className="record-type-icon" aria-hidden="true" />;
    if (t.includes('prescription') || t.includes('medication')) return <Pill className="record-type-icon" aria-hidden="true" />;
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return <Eye className="record-type-icon" aria-hidden="true" />;
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return <Stethoscope className="record-type-icon" aria-hidden="true" />;
    return <FileText className="record-type-icon" aria-hidden="true" />;
  };

  const getRecordTypeName = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lab') || t.includes('blood') || t.includes('test')) return 'Lab Result';
    if (t.includes('prescription') || t.includes('medication')) return 'Prescription';
    if (t.includes('x-ray') || t.includes('scan') || t.includes('mri') || t.includes('ct')) return 'Imaging';
    if (t.includes('visit') || t.includes('consultation') || t.includes('checkup')) return 'Visit';
    return 'Medical Record';
  };

  const formatRecordDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Invalid date';
  };

  const getRecordStats = () => {
    const totalRecords = records.length;
    const recentRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    }).length;
    
    const recordTypes = records.reduce((acc, record) => {
      const type = getRecordTypeName(record.title);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalRecords, recentRecords, recordTypes };
  };

  if (!user) {
    return null; 
  }

  if (loading) {
    return (
      <div className="medical-records">
        <div className="medical-records__loading">
          <Loader2 className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">Loading your medical records...</span>
        </div>
      </div>
    );
  }

  const stats = getRecordStats();

  return (
    <main className="medical-records">
      <div className="medical-records__container">
        {/* Header */}
        <header className="medical-records__header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Medical Records</h1>
              <p className="header-subtitle">
                Access and manage your complete medical history
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <FileText className="stat-badge__icon" aria-hidden="true" />
                <span className="stat-badge__count">{stats.totalRecords}</span>
                <span className="stat-badge__label">Total Records</span>
              </div>
              {stats.recentRecords > 0 && (
                <div className="stat-badge stat-badge--recent">
                  <TrendingUp className="stat-badge__icon" aria-hidden="true" />
                  <span className="stat-badge__count">{stats.recentRecords}</span>
                  <span className="stat-badge__label">Recent</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Quick Stats Overview */}
        {records.length > 0 && (
          <section className="records-overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">Records Overview</h2>
            <div className="overview-grid">
              {Object.entries(stats.recordTypes).map(([type, count]) => (
                <div key={type} className="overview-card">
                  <div className="overview-card__icon">
                    {type === 'Lab Result' && <Activity />}
                    {type === 'Prescription' && <Pill />}
                    {type === 'Imaging' && <Eye />}
                    {type === 'Visit' && <Stethoscope />}
                    {type === 'Medical Record' && <FileText />}
                  </div>
                  <div className="overview-card__content">
                    <span className="overview-card__count">{count}</span>
                    <span className="overview-card__label">{type}{count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="medical-records__controls" aria-label="Search and filter controls">
          <div className="controls-card">
            <div className="search-section">
              <div className="search-group">
                <label htmlFor="search-input" className="sr-only">Search medical records</label>
                <div className="search-input-wrapper">
                  <Search className="search-icon" aria-hidden="true" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search records by title, description, or doctor..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-section">
                <div className="sort-group">
                  <label htmlFor="sort-select" className="sort-label">
                    <Filter className="sort-label__icon" aria-hidden="true" />
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'doctor')}
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-btn"
                  aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  title={`Currently sorting ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="sort-order-icon" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="sort-order-icon" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            <AlertCircle className="error-message__icon" aria-hidden="true" />
            <div className="error-message__content">
              <h2 className="error-message__title">Error Loading Records</h2>
              <p className="error-message__text">{error}</p>
            </div>
          </div>
        )}

        {/* Records Content */}
        <section className="medical-records__content" aria-label="Medical records list">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-state__icon" aria-hidden="true" />
              <h2 className="empty-state__title">
                {searchTerm ? 'No Matching Records Found' : 'No Medical Records'}
              </h2>
              <p className="empty-state__message">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Your medical records will appear here as they become available from your healthcare providers.'
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="empty-state__action"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="results-summary">
                <p className="results-text">
                  Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
                  {searchTerm && (
                    <span className="search-indicator">
                      {' '}matching "<strong>{searchTerm}</strong>"
                    </span>
                  )}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="clear-search-btn"
                    aria-label="Clear search"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Records Grid */}
              <div className="records-grid">
                {filteredRecords.map((record) => (
                  <article 
                    key={record.id} 
                    className={`record-card ${getRecordTypeClass(record.title)}`}
                    aria-labelledby={`record-title-${record.id}`}
                  >
                    {/* Record Type Badge */}
                    <div className="record-type-badge">
                      {getRecordIcon(record.title)}
                      <span className="record-type-name">{getRecordTypeName(record.title)}</span>
                    </div>

                    {/* Record Header */}
                    <header className="record-card__header">
                      <h3 id={`record-title-${record.id}`} className="record-title">
                        {record.title}
                      </h3>
                    </header>

                    {/* Record Body */}
                    <div className="record-card__body">
                      <div className="record-meta">
                        <div className="meta-item">
                          <Calendar className="meta-icon" aria-hidden="true" />
                          <time dateTime={record.date} className="meta-text">
                            {formatRecordDate(record.date)}
                          </time>
                        </div>

                        <div className="meta-item">
                          <User className="meta-icon" aria-hidden="true" />
                          <span className="meta-text">{record.doctor_name}</span>
                        </div>
                      </div>

                      {record.description && (
                        <div className="record-description">
                          <p className="description-text">{record.description}</p>
                        </div>
                      )}

                      {/* Record Actions */}
                      <div className="record-actions">
                        <Link 
                          to={`/medical-records/${record.id}`} 
                          className="record-action-link"
                          aria-label={`View details for ${record.title}`}
                        >
                          <button className="record-btn record-btn--primary">
                            <Eye className="record-btn__icon" aria-hidden="true" />
                            View Details
                          </button>
                        </Link>

                        {record.document_url && (
                          <a
                            href={record.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="record-action-link"
                            aria-label={`Download document for ${record.title}`}
                          >
                            <button className="record-btn record-btn--secondary">
                              <Download className="record-btn__icon" aria-hidden="true" />
                              Download
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
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