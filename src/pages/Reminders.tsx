import React, { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Save, 
  Pencil, 
  Trash, 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reminder {
    id: string;
    user_id?: string;
    title: string;
    description?: string;
    due_date: string;
    priority: "low" | "medium" | "high";
    }

    interface RemindersProps {
    initialReminders?: Reminder[];
    onSave?: (reminder: Reminder) => void;
    onDelete?: (id: string) => void;
    }

    const Reminders: React.FC<RemindersProps> = ({
    initialReminders = [],
    onSave,
    onDelete,
    }) => {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

    // Form validation
    const [formErrors, setFormErrors] = useState<{
        title?: string;
        dueDate?: string;
    }>({});

    // Fetch reminders on mount
    useEffect(() => {
        const fetchReminders = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
            setLoading(false);
            return;
            }
            
            const { data, error } = await supabase
            .from("reminders")
            .select("*")
            .eq("user_id", user.id)
            .order("due_date", { ascending: true });

            if (error) {
            throw error;
            } else if (data) {
            setReminders(data as Reminder[]);
            }
        } catch (err: any) {
            console.error("Error fetching reminders:", err);
            setError("Failed to load reminders. Please try again.");
        } finally {
            setLoading(false);
        }
        };

        fetchReminders();
    }, []);

    // Reset form inputs
    const resetReminderForm = () => {
        setShowForm(false);
        setEditingReminder(null);
        setNewTitle("");
        setNewDescription("");
        setNewDueDate("");
        setNewPriority("medium");
        setFormErrors({});
    };

    // Validate form
    const validateForm = () => {
        const errors: { title?: string; dueDate?: string } = {};
        
        if (!newTitle.trim()) {
        errors.title = "Title is required";
        } else if (newTitle.trim().length > 100) {
        errors.title = "Title must be less than 100 characters";
        }
        
        if (!newDueDate) {
        errors.dueDate = "Due date is required";
        } else {
        const dueDate = new Date(newDueDate);
        const now = new Date();
        if (dueDate < now) {
            errors.dueDate = "Due date must be in the future";
        }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Add or update reminder in Supabase & local state
    const handleReminderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setSaving(true);
        setError(null);

        try {
        if (editingReminder) {
            // Update existing reminder
            const updatedReminder = {
            id: editingReminder.id,
            user_id: user.id,
            title: newTitle.trim(),
            description: newDescription.trim(),
            due_date: newDueDate,
            priority: newPriority,
            };

            const { error } = await supabase
            .from("reminders")
            .update({
                title: updatedReminder.title,
                description: updatedReminder.description,
                due_date: updatedReminder.due_date,
                priority: updatedReminder.priority,
            })
            .eq("id", updatedReminder.id);

            if (error) throw error;

            setReminders((prev) =>
            prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r))
            );
            onSave && onSave(updatedReminder);
        } else {
            // Add new reminder
            const { data, error } = await supabase
            .from("reminders")
            .insert([
                {
                user_id: user.id,
                title: newTitle.trim(),
                description: newDescription.trim(),
                due_date: newDueDate,
                priority: newPriority,
                },
            ])
            .select()
            .single();

            if (error) throw error;

            setReminders((prev) => [...prev, data]);
            onSave && onSave(data);
        }

        resetReminderForm();
        } catch (err: any) {
        console.error("Error saving reminder:", err);
        setError("Failed to save reminder: " + err.message);
        } finally {
        setSaving(false);
        }
    };

    // Edit reminder: populate form with reminder data
    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setShowForm(true);
        setNewTitle(reminder.title);
        setNewDescription(reminder.description || "");
        setNewDueDate(reminder.due_date);
        setNewPriority(reminder.priority);
        setFormErrors({});
        setError(null);
    };

    // Delete reminder from Supabase & local state
    const deleteReminder = async (id: string) => {
        if (
        !window.confirm(
            "Are you sure you want to delete this reminder? This action cannot be undone."
        )
        ) return;

        try {
        const { error } = await supabase.from("reminders").delete().eq("id", id);

        if (error) throw error;

        setReminders((prev) => prev.filter((r) => r.id !== id));
        onDelete && onDelete(id);
        } catch (err: any) {
        console.error("Error deleting reminder:", err);
        setError("Failed to delete reminder: " + err.message);
        }
    };

    const formatReminderDate = (dateStr: string) => {
        const date = parseISO(dateStr);
        return isValid(date) ? format(date, 'PPpp') : 'Invalid date';
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
        case 'high':
            return <AlertTriangle className="priority-icon priority-icon--high" aria-hidden="true" />;
        case 'medium':
            return <Clock className="priority-icon priority-icon--medium" aria-hidden="true" />;
        case 'low':
            return <CheckCircle className="priority-icon priority-icon--low" aria-hidden="true" />;
        default:
            return <Clock className="priority-icon priority-icon--medium" aria-hidden="true" />;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
        case 'high':
            return 'High Priority';
        case 'medium':
            return 'Medium Priority';
        case 'low':
            return 'Low Priority';
        default:
            return 'Medium Priority';
        }
    };

    const upcomingReminders = reminders.filter(r => new Date(r.due_date) > new Date()).length;
    const overdueReminders = reminders.filter(r => new Date(r.due_date) < new Date()).length;

    return (
        <main className="reminders-page">
        <div className="reminders-page__container">
            {/* Header */}
            <header className="reminders-page__header">
            <div className="header-content">
                <div className="header-info">
                <h1 className="header-title">Reminders</h1>
                <p className="header-subtitle">
                    Stay on top of your healthcare tasks and appointments
                </p>
                </div>
                <div className="header-stats">
                <div className="stat-badge">
                    <Bell className="stat-badge__icon" aria-hidden="true" />
                    <span className="stat-badge__count">{reminders.length}</span>
                    <span className="stat-badge__label">Total</span>
                </div>
                {upcomingReminders > 0 && (
                    <div className="stat-badge stat-badge--upcoming">
                    <Clock className="stat-badge__icon" aria-hidden="true" />
                    <span className="stat-badge__count">{upcomingReminders}</span>
                    <span className="stat-badge__label">Upcoming</span>
                    </div>
                )}
                {overdueReminders > 0 && (
                    <div className="stat-badge stat-badge--overdue">
                    <AlertTriangle className="stat-badge__icon" aria-hidden="true" />
                    <span className="stat-badge__count">{overdueReminders}</span>
                    <span className="stat-badge__label">Overdue</span>
                    </div>
                )}
                </div>
            </div>
            </header>

            {/* Controls */}
            <section className="reminders-controls" aria-label="Reminder controls">
            {!showForm && (
                <button 
                onClick={() => setShowForm(true)} 
                className="add-reminder-btn"
                aria-label="Add new reminder"
                >
                <Plus className="add-reminder-btn__icon" aria-hidden="true" />
                Add Reminder
                </button>
            )}
            </section>

            {/* Error Display */}
            {error && (
            <div className="error-message" role="alert">
                <AlertCircle className="error-message__icon" aria-hidden="true" />
                <div className="error-message__content">
                <h2 className="error-message__title">Error</h2>
                <p className="error-message__text">{error}</p>
                <button 
                    className="error-message__dismiss"
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                >
                    <X className="error-message__dismiss-icon" aria-hidden="true" />
                </button>
                </div>
            </div>
            )}

            {/* Form */}
            {showForm && (
            <section className="reminder-form-section" aria-labelledby="form-title">
                <div className="reminder-form-card">
                <header className="reminder-form-card__header">
                    <h2 id="form-title" className="reminder-form-card__title">
                    {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                    </h2>
                    <button
                    onClick={resetReminderForm}
                    className="reminder-form-card__close"
                    aria-label="Close form"
                    >
                    <X className="reminder-form-card__close-icon" aria-hidden="true" />
                    </button>
                </header>

                <form onSubmit={handleReminderSubmit} className="reminder-form">
                    <div className="form-group">
                    <label htmlFor="title" className="form-label">
                        Title <span className="form-required">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        className={`form-input ${formErrors.title ? 'form-input--error' : ''}`}
                        placeholder="Enter reminder title"
                        value={newTitle}
                        onChange={(e) => {
                        setNewTitle(e.target.value);
                        if (formErrors.title) {
                            setFormErrors(prev => ({ ...prev, title: undefined }));
                        }
                        }}
                        required
                        autoFocus
                        maxLength={100}
                    />
                    {formErrors.title && (
                        <span className="form-error">{formErrors.title}</span>
                    )}
                    </div>

                    <div className="form-group">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="form-textarea"
                        placeholder="Enter additional details (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={3}
                        maxLength={500}
                    />
                    <span className="form-help">
                        {newDescription.length}/500 characters
                    </span>
                    </div>

                    <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="dueDate" className="form-label">
                        Due Date & Time <span className="form-required">*</span>
                        </label>
                        <input
                        id="dueDate"
                        type="datetime-local"
                        className={`form-input ${formErrors.dueDate ? 'form-input--error' : ''}`}
                        value={newDueDate}
                        onChange={(e) => {
                            setNewDueDate(e.target.value);
                            if (formErrors.dueDate) {
                            setFormErrors(prev => ({ ...prev, dueDate: undefined }));
                            }
                        }}
                        required
                        />
                        {formErrors.dueDate && (
                        <span className="form-error">{formErrors.dueDate}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority" className="form-label">
                        Priority
                        </label>
                        <select
                        id="priority"
                        className="form-select"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                        >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        </select>
                    </div>
                    </div>

                    <div className="form-actions">
                    <button
                        type="button"
                        onClick={resetReminderForm}
                        className="form-btn form-btn--secondary"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="form-btn form-btn--primary"
                        disabled={saving}
                    >
                        {saving ? (
                        <>
                            <Loader2 className="form-btn__icon form-btn__icon--spinning" aria-hidden="true" />
                            {editingReminder ? 'Updating...' : 'Adding...'}
                        </>
                        ) : (
                        <>
                            {editingReminder ? (
                            <>
                                <Save className="form-btn__icon" aria-hidden="true" />
                                Update Reminder
                            </>
                            ) : (
                            <>
                                <Plus className="form-btn__icon" aria-hidden="true" />
                                Add Reminder
                            </>
                            )}
                        </>
                        )}
                    </button>
                    </div>
                </form>
                </div>
            </section>
            )}

            {/* Loading State */}
            {loading && (
            <div className="loading-state">
                <Loader2 className="loading-spinner" aria-hidden="true" />
                <span className="loading-text">Loading reminders...</span>
            </div>
            )}

            {/* Reminders Content */}
            {!loading && (
            <section className="reminders-content" aria-label="Reminders list">
                {reminders.length === 0 ? (
                <div className="empty-state">
                    <Bell className="empty-state__icon" aria-hidden="true" />
                    <h2 className="empty-state__title">No Reminders</h2>
                    <p className="empty-state__message">
                    You don't have any reminders set. Create your first reminder to stay organized.
                    </p>
                    {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="empty-state__action"
                    >
                        <Plus className="empty-state__action-icon" aria-hidden="true" />
                        Add Your First Reminder
                    </button>
                    )}
                </div>
                ) : (
                <div className="reminders-list">
                    {reminders.map((reminder) => {
                    const isOverdue = new Date(reminder.due_date) < new Date();
                    
                    return (
                        <article 
                        key={reminder.id}
                        className={`reminder-item reminder-item--${reminder.priority} ${isOverdue ? 'reminder-item--overdue' : ''}`}
                        aria-labelledby={`reminder-title-${reminder.id}`}
                        >
                        <div className="reminder-item__priority" aria-label={getPriorityLabel(reminder.priority)}>
                            {getPriorityIcon(reminder.priority)}
                        </div>

                        <div className="reminder-item__content">
                            <header className="reminder-item__header">
                            <h3 id={`reminder-title-${reminder.id}`} className="reminder-item__title mb-2">
                                {reminder.title}
                            </h3>
                            {isOverdue && (
                                <span className="reminder-item__overdue-badge" aria-label="Overdue reminder">
                                Overdue
                                </span>
                            )}
                            </header>
                            
                            {reminder.description && (
                            <p className="reminder-item__description">{reminder.description}</p>
                            )}
                            
                            <div className="reminder-item__meta">
                                <time 
                                    className="reminder-item__time"
                                    dateTime={reminder.due_date}
                                >
                                    <Calendar className="reminder-item__time-icon" aria-hidden="true" />
                                    Due: {formatReminderDate(reminder.due_date)}
                                </time>
                                
                            </div>
                            <span className={`reminder-item__priority-label mt-3 reminder-item__priority-label--${reminder.priority}`}>
                                {getPriorityLabel(reminder.priority)}
                            </span>
                        </div>

                        <div className="reminder-item__actions">
                            <button
                            onClick={() => handleEditReminder(reminder)}
                            className="reminder-action-btn reminder-action-btn--edit"
                            aria-label={`Edit reminder: ${reminder.title}`}
                            >
                            <Pencil className="reminder-action-btn__icon" aria-hidden="true" />
                            </button>
                            <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="reminder-action-btn reminder-action-btn--delete"
                            aria-label={`Delete reminder: ${reminder.title}`}
                            >
                            <Trash className="reminder-action-btn__icon" aria-hidden="true" />
                            </button>
                        </div>
                        </article>
                    );
                    })}
                </div>
                )}
            </section>
            )}
        </div>
        </main>
    );
};

export default Reminders;