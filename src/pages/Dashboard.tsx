import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Activity,
  User,
  FileText,
  Bell,
  Save,
  Pill,
  Pencil,
  Trash,
  ChevronRight,
  Plus,
  TrendingUp,
  Heart,
  Thermometer,
  Zap,
} from "lucide-react";

interface DashboardData {
  appointments: Array<{
    id: string;
    datetime: string;
    status: string;
    title: string;
    doctor_id: string;
    doctor: {
      name: string;
      specialty: string;
      location: string;
    };
    duration: string;
    notes: string;
  }>;
  vitals: {
    heart_rate: number;
    blood_pressure: string;
    temperature: number;
    created_at: string;
  } | null;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    next_dose: string;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    due_date: string;
  }>;
  stats: {
    doctorCount: number;
    notificationCount: number;
  };
}

type Reminder = DashboardData["reminders"][number];

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userName, setUserName] = useState<string>("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const [appointmentsRes, vitalsRes, medicationsRes, remindersRes, doctorCountRes, notificationCountRes] = await Promise.all([
        supabase
          .from("appointments")
          .select(`id, datetime, status, title, duration, notes, doctor_id, doctor:doctor_id(name, specialty, location)`)
          .eq("user_id", user.id)
          .order("datetime", { ascending: true })
          .limit(3),
        supabase.from("vitals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("medications").select("*").eq("user_id", user.id).order("next_dose", { ascending: true }),
        supabase.from("reminders").select("*").eq("user_id", user.id).order("due_date", { ascending: true }).limit(3),
        supabase.from("doctors").select("*", { count: "exact" }),
        supabase.from("notifications").select("*", { count: "exact" }).eq("user_id", user.id).eq("read", false),
      ]);

      const transformedAppointments = appointmentsRes.data?.map((apt) => ({
        ...apt,
        doctor: apt.doctor || { name: "", specialty: "", location: "" },
      })) || [];

      setDashboardData({
        appointments: transformedAppointments,
        vitals: vitalsRes.data || null,
        medications: medicationsRes.data || [],
        reminders: remindersRes.data || [],
        stats: {
          doctorCount: doctorCountRes.count || 0,
          notificationCount: notificationCountRes.count || 0,
        },
      });

      setReminders(remindersRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setUserName(
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User"
      );
    } catch (err) {
      console.warn("Could not fetch user name:", err);
    }
  };

  const resetReminderForm = () => {
    setEditingReminder(null);
    setShowForm(false);
    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setNewPriority("medium");
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate || !user) return;

    const action = editingReminder
      ? supabase.from("reminders").update({
          title: newTitle,
          description: newDescription,
          due_date: newDueDate,
          priority: newPriority,
        }).eq("id", editingReminder.id)
      : supabase.from("reminders").insert([{
          user_id: user.id,
          title: newTitle,
          description: newDescription,
          due_date: newDueDate,
          priority: newPriority,
        }]);

    const { error } = await action;
    if (error) return toast.error(`Error ${editingReminder ? "updating" : "adding"} reminder.`);
    await fetchDashboardData();
    resetReminderForm();
  };

  const deleteReminder = async (id: string) => {
    if (!window.confirm("Delete this reminder?")) return;
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) return toast.error("Error deleting reminder.");
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setNewTitle(reminder.title);
    setNewDescription(reminder.description);
    setNewDueDate(format(parseISO(reminder.due_date), "yyyy-MM-dd'T'HH:mm"));
    setNewPriority(reminder.priority);
    setShowForm(true);
  };

  useEffect(() => {
    if (user) {
      fetchUserName();
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__container">
          <div className="dashboard__loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard">
        <div className="dashboard__container">
          <div className="alert alert--error">
            <div className="alert__icon">
              <Bell />
            </div>
            <div className="alert__content">
              <h2 className="alert__title">Error</h2>
              <p className="alert__message">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" role="main" aria-label="User health dashboard">
      <div className="dashboard__container">
        {/* Header */}
        <div className="dashboard__header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Welcome back, {userName}!</h1>
              <p className="header-subtitle">Here's an overview of your health information.</p>
              <div className="header-actions mb-3 mt-3">
                <Link to="/appointments/book" className="btn btn--primary btn-sm">
                  <Calendar className="btn__icon" />
                  Book Appointment
                </Link>
                <Link to="/medical-records" className="btn btn--success btn-sm">
                  <FileText className="btn__icon" />
                  Records
                </Link>
              </div>
            
            </div>
            
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <User />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{dashboardData?.stats.doctorCount || 0}</h3>
              <p className="stat-card__label">Specialists Available</p>
              <div className="stat-card__trend">
                <TrendingUp className="trend-icon" />
                <span className="trend-text">Expert care you can trust</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <Calendar />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{dashboardData?.appointments.length || 0}</h3>
              <p className="stat-card__label">Upcoming Appointments</p>
              {dashboardData?.appointments[0] && (
                <div className="stat-card__trend">
                  <Clock className="trend-icon" />
                  <span className="trend-text">
                    Next: {format(new Date(dashboardData.appointments[0].datetime), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <Pill />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{dashboardData?.medications.length || 0}</h3>
              <p className="stat-card__label">Active Medications</p>
              {dashboardData?.medications[0] && (
                <div className="stat-card__trend">
                  <Clock className="trend-icon" />
                  <span className="trend-text">
                    Next dose: {format(new Date(dashboardData.medications[0].next_dose), 'h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-card__icon">
              <Bell />
            </div>
            <div className="stat-card__content">
              <h3 className="stat-card__value">{dashboardData?.stats.notificationCount || 0}</h3>
              <p className="stat-card__label">Notifications</p>
              <div className="stat-card__trend">
                <Activity className="trend-icon" />
                <span className="trend-text">
                  {dashboardData?.stats.notificationCount ? 'Unread notifications' : 'All caught up'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Vitals Card */}
          <div className="content-card">
            <div className="content-card__header">
              <h2 className="content-card__title">Latest Vitals</h2>
              {dashboardData?.vitals?.created_at && (
                <span className="btn btn--ghost btn--small">
                  {format(new Date(dashboardData.vitals.created_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <div className="content-card__body">
              {dashboardData?.vitals ? (
                <div className="vitals-grid">
                  <div className="vital-item vital-item--heart">
                    <div className="vital-item__icon vital-item__icon--primary">
                      <Heart />
                    </div>
                    <div className="vital-item__content">
                      <span className="vital-item__value">{dashboardData.vitals.heart_rate} bpm</span>
                      <span className="vital-item__unit"></span>
                      <span className="vital-item__label">Heart Rate</span>
                    </div>
                  </div>
                  <div className="vital-item vital-item--pressure">
                    <div className="vital-item__icon vital-item__icon--warning">
                      <Activity />
                    </div>
                    <div className="vital-item__content">
                      <span className="vital-item__value">{dashboardData.vitals.blood_pressure}</span>
                      <span className="vital-item__unit"></span>
                      <span className="vital-item__label">Blood Pressure</span>
                    </div>
                  </div>
                  <div className="vital-item vital-item--temp">
                    <div className="vital-item__icon  vital-item__icon--success">
                      <Thermometer />
                    </div>
                    <div className="vital-item__content">
                      <span className="vital-item__value">{dashboardData.vitals.temperature} °F</span>
                      <span className="vital-item__unit"></span>
                      <span className="vital-item__label">Temperature</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Zap className="empty-state__icon" />
                  <p className="empty-state__text">No vitals recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="content-card">
            <div className="content-card__header">
              <h2 className="content-card__title">Quick Actions</h2>
            </div>
            <div className="content-card__body">
              <div className="quick-actions">
                <Link to="/appointments/book" className="quick-action quick-action--primary">
                  <div className="quick-action__icon quick-action__icon--primary">
                    <Calendar />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">Book Appointment</h3>
                    <p className="quick-action__description">Schedule with your preferred doctor</p>
                  </div>
                  <ChevronRight className="quick-action__arrow" />
                </Link>
                <Link to="/medical-records" className="quick-action quick-action--success">
                  <div className="quick-action__icon quick-action__icon--success">
                    <FileText />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">View Records</h3>
                    <p className="quick-action__description">Access your medical history</p>
                  </div>
                  <ChevronRight className="quick-action__arrow" />
                </Link>
                <Link to="/medications" className="quick-action quick-action--warning">
                  <div className="quick-action__icon quick-action__icon--warning">
                    <Pill />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">Medications</h3>
                    <p className="quick-action__description">Manage your prescriptions</p>
                  </div>
                  <ChevronRight className="quick-action__arrow" />
                </Link>

                <Link to="/vitals" className="quick-action quick-action--info">
                  <div className="quick-action__icon quick-action__icon--info">
                    <Activity />
                  </div>
                  <div className="quick-action__content">
                    <h3 className="quick-action__title">Health Insights</h3>
                    <p className="quick-action__description">View your health trends</p>
                  </div>
                  <ChevronRight className="quick-action__arrow" />
                </Link>
              </div>
            </div>
          </div>

          {/* Appointments Card */}
          <div className="content-card">
            <div className="content-card__header">
              <h2 className="content-card__title">Upcoming Appointments</h2>
              <div className="content-card__actions">
                <Link to="/appointments" className="btn btn--ghost btn--small">
                  View All <ChevronRight className="btn__icon" size={16}/>
                </Link>
              </div>
            </div>
            <div className="content-card__body">
              {dashboardData?.appointments.length === 0 ? (
                <div className="empty-state">
                  <Calendar className="empty-state__icon" size={18}/>
                  <p className="empty-state__text">No upcoming appointments</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {dashboardData?.appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      
                      <div className="appointment-item__details">
                        <h3 className="patient-name">{appointment.title}</h3>
                        <p className="appointment-type">
                          {appointment.doctor.name} • {appointment.doctor.specialty}
                        </p>
                        <div className="appointment-item__time">
                          <Clock className="time-icon" />
                          <span className="time-text">
                            {format(new Date(appointment.datetime), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                      <span className={`appointment-status status--${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reminders Card */}
          <div className="content-card ">
            <div className="content-card__header">
              <h2 className="content-card__title">Reminders</h2>
              <div className="content-card__actions">
                {!showForm && (
                  <button 
                    onClick={() => setShowForm(true)} 
                    className="btn btn--primary btn--small"
                  >
                    <Plus className="btn__icon" size={16}/>
                    Add
                  </button>
                )}
              </div>
            </div>
            <div className="content-card__body">
              {showForm && (
                <form onSubmit={handleReminderSubmit} className="reminder-form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Reminder title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="form-textarea"
                      rows={2}
                    />
                  </div>
             
                    <div className="form-group">
                      <input
                        type="datetime-local"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                        className="form-select"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn--primary btn--small">
                      <Save className="btn__icon" />
                      {editingReminder ? "Update" : "Add"}
                    </button>
                    <button 
                      type="button" 
                      onClick={resetReminderForm}
                      className="btn btn--success btn--small"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {reminders.length === 0 && !showForm ? (
                <div className="empty-state">
                  <Bell className="empty-state__icon" />
                  <p className="empty-state__text">No reminders set</p>
                </div>
              ) : (
                <div className="reminders-list">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className={`reminder-item reminder-item--${reminder.priority}`}>
                      <div className="reminder-item__content">
                        <h4 className="reminder-item__title">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="reminder-item__description">{reminder.description}</p>
                        )}
                        <span className="reminder-item__time">
                          Due: {format(new Date(reminder.due_date), "MMM d, h:mm a")}
                        </span>
                   
                      </div>
                       <div className="reminder-item__actions">
                        <button
                          onClick={() => handleEditReminder(reminder)}
                          className="btn btn--ghost btn--icon"
                          aria-label="Edit reminder"
                        >
                          <Pencil className="btn__icon" />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="btn btn--ghost btn--icon"
                          aria-label="Delete reminder"
                        >
                          <Trash className="btn__icon" />
                        </button>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center justify-content-end mb-4 mr-4">
              <Link to="/reminders" className="btn btn--outline btn--small">
                View All <ChevronRight className="btn__icon" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;