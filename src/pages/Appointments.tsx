import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Search, 
  Plus, 
  CheckCircle, 
  Pencil, 
  X, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import {
  format, 
  isAfter, 
  isBefore, 
  startOfMonth, 
  endOfMonth,
  startOfWeek, 
  endOfWeek, 
  addDays
} from "date-fns";
import { toast } from "sonner";


interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  phone?: string;
  email?: string;
  profile_image_url?: string;
  available_days: string[];
  working_hours: {
    start: string;
    end: string;
  };
  slot_duration_minutes: number;
}

interface Appointment {
  id: string;
  doctor_id: string;
  datetime: string;
  status: string;
  title: string;
  duration: string;
  notes: string | null;
  doctors?: Doctor;
}

type AppointmentFilter = "all" | "upcoming" | "past" | "cancelled";

interface Slot {
  dateTime: string;
  booked: boolean;
  isPast: boolean;
  isAvailable: boolean;
}

export default function Appointments() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Reschedule modal state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Calendar state
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotDateTime, setSelectedSlotDateTime] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Calendar setup
  useEffect(() => {
    const startMonth = startOfMonth(new Date(calendarYear, calendarMonth));
    const endMonth = endOfMonth(new Date(calendarYear, calendarMonth));
    const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    setCalendarDays(days);
  }, [calendarMonth, calendarYear]);

  // Modal keyboard handling
  useEffect(() => {
    if (!showRescheduleModal) return;
    modalRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowRescheduleModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showRescheduleModal]);

  // Data fetching
  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  // Filter appointments
  useEffect(() => {
    const now = new Date();
    let filtered = [...appointments];
    
    if (filter !== "all") {
      filtered = filtered.filter(a =>
        filter === "upcoming"
          ? isAfter(new Date(a.datetime), now) && a.status !== "cancelled"
          : filter === "past"
            ? isBefore(new Date(a.datetime), now) && a.status !== "cancelled"
            : a.status === "cancelled"
      );
    }
    
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(s) ||
        a.doctors?.name.toLowerCase().includes(s) ||
        a.doctors?.specialty.toLowerCase().includes(s) ||
        a.notes?.toLowerCase().includes(s)
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, filter, searchTerm]);

  // Internal Components
  const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
    <div className="loading-state">
      <Loader2 className="loading-spinner" aria-hidden="true" />
      <span className="loading-text">{text}</span>
    </div>
  );

  const ErrorState = ({ title, message }: { title: string; message: string }) => (
    <div className="error-state" role="alert" aria-live="assertive">
      <AlertCircle className="error-state__icon" aria-hidden="true" />
      <div className="error-state__content">
        <h3 className="error-state__title">{title}</h3>
        <p className="error-state__message">{message}</p>
      </div>
    </div>
  );

  const EmptyState = ({ 
    title, 
    message, 
    showAction = false, 
    actionText = '', 
    actionHref = '' 
  }: { 
    title: string; 
    message: string; 
    showAction?: boolean; 
    actionText?: string; 
    actionHref?: string; 
  }) => (
    <div className="empty-state">
      <Calendar className="empty-state__icon" aria-hidden="true" />
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {showAction && (
        <Link to={actionHref} className="empty-state__action">
          <Plus className="empty-state__action-icon" aria-hidden="true" />
          {actionText}
        </Link>
      )}
    </div>
  );

  const DoctorAvatar = ({ doctor }: { doctor: Doctor }) => (
    <div className="doctor-info">
      {doctor.profile_image_url ? (
        <img
          src={doctor.profile_image_url}
          alt={`Dr. ${doctor.name}`}
          className="doctor-avatar"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            (e.currentTarget as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <div className="doctor-avatar-placeholder">
          <User aria-hidden="true" />
        </div>
      )}
      <div className="doctor-details">
        <h4 className="doctor-details__name"> {doctor.name}</h4>
        <p className="doctor-details__specialty">{doctor.specialty}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      <CheckCircle className="status-badge__icon" aria-hidden="true" />
      {status}
    </span>
  );

  const ContactDetails = ({ doctor }: { doctor: Doctor }) => (
    <div className="contact-details">
      <div className="contact-item">
        <MapPin className="contact-item__icon" aria-hidden="true" />
        <span className="contact-item__text">{doctor.location}</span>
      </div>
      {doctor.phone && (
        <div className="contact-item">
          <Phone className="contact-item__icon" aria-hidden="true" />
          <span className="contact-item__text">{doctor.phone}</span>
        </div>
      )}
      {doctor.email && (
        <div className="contact-item">
          <Mail className="contact-item__icon" aria-hidden="true" />
          <span className="contact-item__text">{doctor.email}</span>
        </div>
      )}
    </div>
  );

  const CalendarComponent = () => (
    <div className="calendar">
      <div className="calendar__header">
        <button
          onClick={handlePrevMonth}
          className="calendar__nav"
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <h3>{format(new Date(calendarYear, calendarMonth), 'MMMM yyyy')}</h3>
        <button
          onClick={handleNextMonth}
          className="calendar__nav"
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="calendar__weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar__weekday">{day}</div>
        ))}
      </div>

      <div className="calendar__days">
        {calendarDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDay;
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isCurrentMonth = day.getMonth() === calendarMonth;
          const isPast = day < today;

          return (
            <button
              key={index}
              onClick={() => !isPast && isCurrentMonth ? handleDaySelection(dateStr) : null}
              className={`calendar__day ${
                isSelected ? 'calendar__day--selected' : ''
              } ${isToday ? 'calendar__day--today' : ''} ${
                !isCurrentMonth ? 'calendar__day--empty' : ''
              } ${isPast || !isCurrentMonth ? 'calendar__day--unavailable' : 'calendar__day--available'}`}
              disabled={isPast || !isCurrentMonth}
              aria-label={`Select ${format(day, 'MMMM d, yyyy')}`}
            >
              {isCurrentMonth && (
                <span className="calendar__day-number">{format(day, 'd')}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const TimeSlots = () => (
    <div>
      <h4>Available Times</h4>
      {loadingSlots ? (
        <LoadingSpinner text="Loading time slots..." />
      ) : slots.length === 0 ? (
        <p>No available time slots for this date.</p>
      ) : (
        <div className="time-slots">
          {slots.map((slot, index) => {
            const isSelected = selectedSlotDateTime === slot.dateTime;
            return (
              <button
                key={index}
                onClick={() => !slot.booked && !slot.isPast ? setSelectedSlotDateTime(slot.dateTime) : null}
                disabled={slot.booked || slot.isPast}
                className={`time-slot ${
                  isSelected ? 'time-slot--selected' : ''
                } ${slot.booked || slot.isPast ? 'time-slot--unavailable' : ''}`}
                aria-label={`Select ${format(new Date(slot.dateTime), 'h:mm a')}`}
              >
                {format(new Date(slot.dateTime), 'h:mm a')}
                {slot.booked && ' (Booked)'}
                {slot.isPast && ' (Past)'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const RescheduleModal = () => (
    <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-header__title">Reschedule Appointment</h3>
          <button
            onClick={() => setShowRescheduleModal(false)}
            className="modal-header__close"
            aria-label="Close modal"
          >
            <X className="modal-header__close__icon" />
          </button>
        </div>

        <div className="modal-body">
          <CalendarComponent />
          {selectedDay && <TimeSlots />}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => setShowRescheduleModal(false)}
            className="action-btn action-btn--secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleRescheduleSubmit}
            disabled={!selectedSlotDateTime}
            className="action-btn action-btn--primary"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );

  // Data fetching functions
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, doctor_id, datetime, status, title, duration, notes,
          doctors ( id, name, specialty, location, phone, email, profile_image_url, available_days, working_hours, slot_duration_minutes )
        `)
        .eq("user_id", user!.id)
        .order("datetime", { ascending: false });
        
      if (error) throw error;
      
      const cleanedData = (data || []).map((a: any) => ({
        ...a,
        doctors: Array.isArray(a.doctors) ? a.doctors[0] : a.doctors
      }));
      
      setAppointments(cleanedData);
    } catch (err: any) {
      setError("Failed to load appointments: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    const { error: cancelError } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
      
    if (cancelError) return toast.error("Failed to cancel appointment");

    await supabase.from("notifications").insert({
      user_id: user?.id,
      appointment_id: id,
      type: "cancellation",
      title: "Appointment Cancelled",
      message: "Your appointment has been cancelled successfully.",
      created_at: new Date().toISOString(),
      read: false
    });

    toast.success("Appointment cancelled successfully!");
    fetchAppointments();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this appointment?")) return;

    try {
      const { error: reminderDeleteError } = await supabase
        .from("reminders")
        .delete()
        .eq("appointment_id", id);

      const { error: appointmentDeleteError } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (appointmentDeleteError) {
        toast.error("Failed to delete appointment");
      } else {
        toast.success("Appointment deleted successfully");
        fetchAppointments();
      }
    } catch (error) {
      toast.error("An error occurred while deleting the appointment");
    }
  };

  const handleReschedule = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      setSelectedAppointmentId(id);
      setSelectedDoctorId(appointment.doctor_id);
      setShowRescheduleModal(true);
      setSelectedDay("");
      setSlots([]);
      setSelectedSlotDateTime("");
      setCalendarYear(today.getFullYear());
      setCalendarMonth(today.getMonth());
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedSlotDateTime) return toast.error("Please select a date and time");
    if (new Date(selectedSlotDateTime) <= new Date()) return toast.error("Selected time must be in the future");
    if (!selectedAppointmentId) return;

    const newDatetime = selectedSlotDateTime;

    // Check availability
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", selectedDoctorId)
      .eq("datetime", newDatetime)
      .neq("id", selectedAppointmentId)
      .in("status", ["pending", "confirmed", "rescheduled"]);

    if (conflictError) return toast.error("Error checking availability");
    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return toast.error("This time slot is no longer available");
    }

    // Update appointment
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ datetime: newDatetime, status: "rescheduled" })
      .eq("id", selectedAppointmentId);

    if (updateError) return toast.error("Failed to reschedule appointment");

    // Get doctor info for notification
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("name")
      .eq("id", selectedDoctorId)
      .single();

    if (doctorError || !doctor) {
      console.error("Failed to fetch doctor info:", doctorError);
      return toast.error("Could not get doctor details");
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: user?.id,
      appointment_id: selectedAppointmentId,
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${doctor.name} has been rescheduled to ${format(new Date(newDatetime), "PPpp")}.`,
      created_at: new Date().toISOString(),
      read: false
    });

    // Update reminder
    const reminderTime = new Date(new Date(newDatetime).getTime() - 60 * 60 * 1000);
    const { data: existingReminder } = await supabase
      .from('reminders')
      .select('id')
      .eq('appointment_id', selectedAppointmentId)
      .single();

    if (existingReminder) {
      await supabase
        .from('reminders')
        .update({
          title: "Appointment Reminder",
          due_date: reminderTime.toISOString(),
          description: `Reminder: Your appointment with ${doctor.name} is in 1 hour.`,
          sent: false
        })
        .eq('id', existingReminder.id);
    } else {
      await supabase.from('reminders').insert({
        title: "Appointment Rescheduled",
        user_id: user?.id,
        appointment_id: selectedAppointmentId,
        due_date: reminderTime.toISOString(),
        description: `Reminder: Your appointment with ${doctor.name} is in 1 hour.`,
        priority: 'medium',
        sent: false,
        created_at: new Date().toISOString()
      });
    }

    toast.success("Appointment rescheduled successfully!");
    setShowRescheduleModal(false);
    fetchAppointments();
  };

  // Calendar navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(y => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(m => m - 1);
    }
    setSelectedDay("");
    setSlots([]);
    setSelectedSlotDateTime("");
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(y => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(m => m + 1);
    }
    setSelectedDay("");
    setSlots([]);
    setSelectedSlotDateTime("");
  };

  const handleDaySelection = (dateStr: string) => {
    setSelectedDay(dateStr);
    setSelectedSlotDateTime("");
    fetchSlotsForDay(dateStr);
  };

  const fetchSlotsForDay = async (dayStr: string) => {
    if (!selectedAppointmentId || !selectedDoctorId) return;
    setLoadingSlots(true);
    setSlots([]);

    try {
      // Fetch appointment duration
      const { data: apt, error: e1 } = await supabase
        .from("appointments")
        .select("duration")
        .eq("id", selectedAppointmentId)
        .single();
      if (e1 || !apt) throw new Error("Failed to fetch appointment details");

      const dur = parseInt(apt.duration || "30", 10);

      // Fetch doctor info
      const { data: doctor, error: e2 } = await supabase
        .from("doctors")
        .select("available_days, working_hours, slot_duration_minutes")
        .eq("id", selectedDoctorId)
        .single();
      if (e2 || !doctor) throw new Error("Failed to fetch doctor details");

      let workingHours = doctor.working_hours;
      if (typeof workingHours === "string") {
        workingHours = JSON.parse(workingHours);
      }

      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayDate = new Date(dayStr + "T00:00:00");
      const dayName = daysOfWeek[dayDate.getDay()];

      const availableDaysLower = doctor.available_days.map((d: string) => d.toLowerCase());

      if (!availableDaysLower.includes(dayName.toLowerCase())) {
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      const [startHour, startMinute] = workingHours.start.split(":").map(Number);
      const [endHour, endMinute] = workingHours.end.split(":").map(Number);

      const startTime = new Date(dayDate);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(dayDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      const slotDurationMs = (doctor.slot_duration_minutes || 30) * 60 * 1000;

      // Fetch existing appointments
      const dayStart = new Date(dayStr + "T00:00:00").toISOString();
      const dayEnd = new Date(dayStr + "T23:59:59").toISOString();

      const { data: booked, error: e3 } = await supabase
        .from("appointments")
        .select("datetime, duration")
        .eq("doctor_id", selectedDoctorId)
        .gte("datetime", dayStart)
        .lte("datetime", dayEnd)
        .neq("id", selectedAppointmentId)
        .in("status", ["pending", "confirmed", "rescheduled"]);
      if (e3) throw e3;

      const slots: Slot[] = [];
      let slotTime = new Date(startTime);
      const now = new Date();

      while (slotTime.getTime() + slotDurationMs <= endTime.getTime()) {
        const slotEnd = new Date(slotTime.getTime() + slotDurationMs);
        const isPast = slotTime <= now;

        const overlaps = booked?.some(b => {
          const bStart = new Date(b.datetime);
          const bDuration = parseInt(b.duration || "30", 10);
          const bEnd = new Date(bStart.getTime() + bDuration * 60000);
          return (slotTime < bEnd) && (slotEnd > bStart);
        }) ?? false;

        const isAvailable = !isPast && !overlaps;

        slots.push({ 
          dateTime: slotTime.toISOString(), 
          booked: overlaps,
          isPast,
          isAvailable
        });
        
        slotTime = new Date(slotTime.getTime() + slotDurationMs);
      }

      setSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots([]);
      toast.error("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const getAppointmentCategory = (a: Appointment) => {
    const d = new Date(a.datetime);
    if (a.status === "cancelled") return "cancelled";
    return isAfter(d, new Date()) ? "upcoming" : "past";
  };

  if (!user) return null;

  return (
    <main className="appointments-page">
      <div className="appointments-page__container">
        {/* Header */}
        <header className="appointments-page__header">
          <h1 className="page-header__title">My Appointments</h1>
          <p className="page-header__subtitle">Manage your healthcare appointments</p>
          <Link to="/appointments/book" className="page-header__action">
            <Plus className="page-header__action__icon" aria-hidden="true" />
            Book New Appointment
          </Link>
        </header>

        {/* Controls */}
        <section className="appointments-page__controls">
          <div className="appointments-controls">
            <div className="search-form">
              <Search className="search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                className="search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search appointments"
              />
            </div>
            
            <div className="filter-buttons" role="group" aria-label="Filter appointments by status">
              {(["all", "upcoming", "past", "cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
                  aria-pressed={filter === f}
                  aria-label={`Show ${f} appointments`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="appointments-page__content">
          {error && (
            <ErrorState 
              title="Error Loading Appointments" 
              message={error} 
            />
          )}
          
          {loading && (
            <LoadingSpinner text="Loading appointments..." />
          )}

          {!loading && !error && (
            filteredAppointments.length === 0 ? (
              <EmptyState
                title={searchTerm ? "No matching appointments" : "No appointments found"}
                message={searchTerm 
                  ? "Try adjusting your search terms or filters" 
                  : "You haven't booked any appointments yet"
                }
                showAction={!searchTerm}
                actionText="Book Your First Appointment"
                actionHref="/appointments/book"
              />
            ) : (
              <div className="appointments-list">
                {filteredAppointments.map((appointment) => {
                  const category = getAppointmentCategory(appointment);
                  const zonedDate = new Date(appointment.datetime);

                  return (
                    <article 
                      key={appointment.id} 
                      className={`appointment-card ${category === "past" ? "appointment-card--past" : ""}`}
                      aria-labelledby={`appointment-title-${appointment.id}`}
                    >
                      <header className="appointment-card__header">
                        <h3 id={`appointment-title-${appointment.id}`} className="appointment-card__title">
                          {appointment.title}
                        </h3>
                      </header>

                      <div className="appointment-card__body">
                        {appointment.doctors && (
                          <DoctorAvatar doctor={appointment.doctors} />
                        )}

                        <div className="appointment-meta">
                          <div className="meta-item">
                            <Calendar className="meta-item__icon" aria-hidden="true" />
                            <span className="meta-item__text">
                              {format(zonedDate, "EEEE, MMMM d, yyyy")}
                            </span>
                          </div>
                          
                          <div className="meta-item">
                            <Clock className="meta-item__icon" aria-hidden="true" />
                            <span className="meta-item__text">
                              {format(zonedDate, "h:mm a")}
                            </span>
                          </div>
                          
                          <StatusBadge status={appointment.status} />
                        </div>

                        {appointment.doctors && (
                          <ContactDetails doctor={appointment.doctors} />
                        )}

                        {appointment.notes && (
                          <div className="appointment-notes">
                            <div className="appointment-notes__label">Notes:</div>
                            <p className="appointment-notes__text">{appointment.notes}</p>
                          </div>
                        )}
                      </div>

                      <footer className="appointment-card__footer">
                        <div className="appointment-actions">
                          {category === "upcoming" && appointment.status.toLowerCase() !== "cancelled" && (
                            <>
                              <button
                                onClick={() => handleReschedule(appointment.id)}
                                className="action-btn action-btn--primary"
                                aria-label={`Reschedule appointment: ${appointment.title}`}
                              >
                                <Pencil className="action-btn__icon" aria-hidden="true" />
                                Reschedule
                              </button>

                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="action-btn action-btn--secondary"
                                aria-label={`Cancel appointment: ${appointment.title}`}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {appointment.status.toLowerCase() === "cancelled" && category === "past" &&(
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(appointment.id);
                              }}
                              className="btn btn-outline btn-warning btn-sm  ml-2"
                              aria-label={`Delete cancelled appointment titled ${appointment.title}`}
                              type="button"
                            >
                              <Trash2 className="mr-2" size={16}  aria-hidden="true"/>
                              Delete
                            </button>
                          )}
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )
          )}
        </section>

        {/* Reschedule Modal */}
        {showRescheduleModal && <RescheduleModal />}
      </div>
    </main>
  );
}