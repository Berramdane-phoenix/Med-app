import React, { useState, useEffect } from 'react'
import { supabase, VitalRecord } from '@/lib/supabase'
import { 
    Heart, 
    Thermometer, 
    Activity, 
    Weight, 
    Ruler, 
    Plus, 
    Search, 
    Calendar,
    X,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2
    } from 'lucide-react'
    import { format } from 'date-fns'

    const Vitals: React.FC = () => {
    const [vitals, setVitals] = useState<VitalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState<Partial<VitalRecord>>({
        patient_id: '',
        patient_name: '',
        systolic_bp: undefined,
        diastolic_bp: undefined,
        heart_rate: undefined,
        temperature: undefined,
        oxygen_saturation: undefined,
        weight: undefined,
        height: undefined,
        recorded_by: 'Healthcare Provider',
        notes: ''
    })

    useEffect(() => {
        fetchVitals()
    }, [])

    const fetchVitals = async () => {
        try {
        setLoading(true)
        const { data, error } = await supabase
            .from('vitals')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        setVitals(data || [])
        } catch (error) {
        console.error('Error fetching vitals:', error)
        showNotification('error', 'Failed to load vitals data')
        } finally {
        setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.patient_id || !formData.patient_name) {
        showNotification('error', 'Patient ID and name are required')
        return
        }

        try {
        setSubmitting(true)
        const vitalRecord: VitalRecord = {
            ...formData,
            recorded_at: new Date().toISOString(),
        } as VitalRecord

        const { error } = await supabase
            .from('vitals')
            .insert([vitalRecord])

        if (error) throw error

        showNotification('success', 'Vitals recorded successfully')
        resetForm()
        setShowForm(false)
        fetchVitals()
        } catch (error) {
        console.error('Error saving vitals:', error)
        showNotification('error', 'Failed to save vitals')
        } finally {
        setSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
        patient_id: '',
        patient_name: '',
        systolic_bp: undefined,
        diastolic_bp: undefined,
        heart_rate: undefined,
        temperature: undefined,
        oxygen_saturation: undefined,
        weight: undefined,
        height: undefined,
        recorded_by: 'Healthcare Provider',
        notes: ''
        })
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleFormClose = () => {
        setShowForm(false)
        resetForm()
    }

    return (
        <div className="vitals-container">
        {notification && (
            <div className={`notification notification--${notification.type}`}>
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {notification.message}
            </div>
        )}

        <div className="vitals-header">
            <div className="header-info">
            <h1 className="vitals-header__title">
                <Activity className="vitals-header__icon" size={32} />
                Patient Vitals
            </h1>
            
            </div>

            <div className="vitals-controls">
                <button 
                    className="btn btn--primary mb-3 "
                        onClick={() => setShowForm(true)}
                    >
                    <Plus size={18} />
                    Record Vitals
                </button>
                <div className="search-box">
                    <Search className="search-box__icon" size={18} />
                    <input
                    type="text"
                    placeholder="Search by patient name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-box__input"
                    />
                </div>
            </div>
        </div>

        {showForm && (
            <div className="vitals-form-overlay" onClick={(e) => e.target === e.currentTarget && handleFormClose()}>
            <form className="vitals-form" onSubmit={handleSubmit}>
                <div className="vitals-form__header">
                <h2>Record New Vitals</h2>
                <button 
                    type="button" 
                    className="btn btn--ghost"
                    onClick={handleFormClose}
                >
                    <X size={20} />
                </button>
                </div>

                <div className="vitals-form__content">
                <div className="vitals-form__grid">
                    <div className="input  form-group">
                    <label className='form-label'>Patient ID *</label>
                    <input
                        type="text"
                        required
                        placeholder="Enter patient ID"
                        value={formData.patient_id || ''}
                        onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                    />
                    </div>

                    <div className="input  form-group">
                    <label className='form-label'>Patient Name *</label>
                    <input
                        type="text"
                        required
                        className='input '
                        placeholder="Enter patient name"
                        value={formData.patient_name || ''}
                        onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                    />
                    </div>

                    <div className="form-group input  form-group--bp">
                    <label className='form-label'>Blood Pressure (mmHg)</label>
                    <div className="bp-inputs">
                        <input
                        type="number"
                        className='input'
                        placeholder="Systolic"
                        value={formData.systolic_bp || ''}
                        onChange={(e) => setFormData({...formData, systolic_bp: Number(e.target.value) || undefined})}
                        />
                        <span className="bp-separator">/</span>
                        <input
                        type="number"
                        placeholder="Diastolic"
                        value={formData.diastolic_bp || ''}
                        onChange={(e) => setFormData({...formData, diastolic_bp: Number(e.target.value) || undefined})}
                        />
                    </div>
                    </div>

                    <div className="input form-group">
                    <label className='form-label'>Heart Rate (bpm)</label>
                    <input
                        type="number"
                        placeholder="Enter heart rate"
                        value={formData.heart_rate || ''}
                        onChange={(e) => setFormData({...formData, heart_rate: Number(e.target.value) || undefined})}
                    />
                    </div>

                    <div className="input  form-group">
                    <label className='form-label'>Temperature (°F)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Enter temperature"
                        value={formData.temperature || ''}
                        onChange={(e) => setFormData({...formData, temperature: Number(e.target.value) || undefined})}
                    />
                    </div>

                    <div className="input form-group">
                    <label className='form-label'>Oxygen Saturation (%)</label>
                    <input
                        type="number"
                        placeholder="Enter O2 saturation"
                        value={formData.oxygen_saturation || ''}
                        onChange={(e) => setFormData({...formData, oxygen_saturation: Number(e.target.value) || undefined})}
                    />
                    </div>

                    <div className="input form-group">
                    <label className='form-label'>Weight (lbs)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Enter weight"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({...formData, weight: Number(e.target.value) || undefined})}
                    />
                    </div>

                    <div className="input form-group">
                    <label className='form-label'>Height (inches)</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Enter height"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({...formData, height: Number(e.target.value) || undefined})}
                    />
                    </div>

                    <div className="form-group input  form-group--full">
                    <label className='form-label'>Notes</label>
                    <textarea
                        placeholder="Additional notes or observations..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                    />
                    </div>
                </div>
                </div>

                <div className="vitals-form__actions">
                <button type="button" className="btn btn--ghost" onClick={handleFormClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                    {submitting ? <Loader2 size={18} className="loading-icon" /> : <Save size={18} />}
                    {submitting ? 'Saving...' : 'Save Vitals'}
                </button>
                </div>
            </form>
            </div>
        )}
        </div>
    )
}

export default Vitals