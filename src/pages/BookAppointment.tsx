import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User as LucidUser, MapPin, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type Doctor, type Appointment } from '@/lib/supabase';
import {
  getUserTimezone,
  utcToLocal,
  localToUtc,
  formatInUserTimezone,
  getDayBoundsInUtc,
  generateTimeSlotsForDay,
  isInPast,
  getTodayString,
  formatTimeForDisplay,
  formatDateForDisplay,
  getTimezoneInfo
} from '@/utils/timezone';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';


interface TimeSlot {
  localDateTime: Date;
  utcDateTime: Date;
  isBooked: boolean;
  isPast: boolean;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BookAppointment: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  // User timezone info
  const [userTimezone] = useState(getUserTimezone());
  const [timezoneInfo] = useState(getTimezoneInfo());

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD in user's timezone

  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking state
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Load time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;
        const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found — ensure the user is authenticated.");
        return;
  }

      // Process doctor images
      const doctorsWithImages = await Promise.all(
        data.map(async (doctor: Doctor) => {
          if (doctor.profile_image_url && !doctor.profile_image_url.startsWith('http')) {
            const { data: imageData } = supabase.storage
              .from('doctor-images')
              .getPublicUrl(doctor.profile_image_url);
            return { ...doctor, profile_image_url: imageData.publicUrl };
          }
          return doctor;
        })
      );

      setDoctors(doctorsWithImages);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoadingSlots(true);
      
      // Check if the selected date is available for this doctor
      const selectedDateObj = parseISO(selectedDate + 'T00:00:00');
      const dayOfWeek = WEEKDAYS[getDay(selectedDateObj)];
      
      if (!selectedDoctor.available_days.includes(dayOfWeek)) {
        setTimeSlots([]);
        return;
      }

      // Generate time slots in user's timezone
      const slots = generateTimeSlotsForDay(
        selectedDate,
        selectedDoctor.working_hours,
        selectedDoctor.slot_duration_minutes,
        userTimezone
      );

      // Get day boundaries in UTC for database query
      const { startUtc, endUtc } = getDayBoundsInUtc(selectedDate, userTimezone);
     // Fetch user again
      const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          toast.error('You must be logged in to book an appointment.');
          return;
        }

      // Fetch existing appointments for this doctor on this day
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('datetime')
        .eq('doctor_id', selectedDoctor.id)
        .gte('datetime', startUtc.toISOString())
        .lte('datetime', endUtc.toISOString())
        .in('status', ['pending', 'confirmed', 'rescheduled']);

      if (error) throw error;
      function normalizeISOStringToSeconds(isoString: string) {
        return isoString.slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
      }
      // Create set of booked times in UTC
      const bookedUtcTimes = new Set(
          appointments.map((apt) => normalizeISOStringToSeconds(apt.datetime))
        );

        const timeSlotObjects: TimeSlot[] = slots.map(localDateTime => {
          const utcDateTime = localToUtc(localDateTime, userTimezone);
          const utcString = normalizeISOStringToSeconds(utcDateTime.toISOString());

          return {
            localDateTime,
            utcDateTime,
            isBooked: bookedUtcTimes.has(utcString),
            isPast: isInPast(localDateTime, userTimezone)
          };
        });

      setTimeSlots(timeSlotObjects);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedSlot(null);
    setTimeSlots([]);
  };

  const handleDateSelect = (dateString: string) => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor first');
      return;
    }

    setSelectedDate(dateString);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isBooked || slot.isPast) return;
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error('Please select a doctor and time slot');
      return;
    }

    try {
      setIsBooking(true);

      // Double-check that the slot is still available
      const { data: existingAppointments, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', selectedDoctor.id)
        .eq('datetime', selectedSlot.utcDateTime.toISOString())
        .in('status', ['pending', 'confirmed', 'rescheduled']);


      if (checkError) throw checkError;

      if (existingAppointments && existingAppointments.length > 0) {
        toast.error('This time slot was just booked by someone else. Please select another time.');
        await loadTimeSlots(); // Refresh slots
        return;
      }

      // Create the appointment with UTC datetime
      const { data: insertData, error: insertError } = await supabase
      .from('appointments')
      .insert({
        user_id: user?.id,
        doctor_id: selectedDoctor.id,
        datetime: selectedSlot.utcDateTime.toISOString(),
        notes: notes.trim() || null,
        status: 'pending',
        title: `Consultation`
      }).select()
      .single(); 


      if (insertError) throw insertError;

      toast.success('Appointment booked successfully!');

      // Calculate reminder time
      const appointmentUtcTime = selectedSlot.utcDateTime;
      const reminderTime = new Date(appointmentUtcTime.getTime() - 60 * 60 * 1000); // 1 hour before appointment

      // Insert notification and reminder separately and check errors
      const notificationResult = await supabase.from('notifications').insert({
        user_id: user?.id,
        appointment_id: insertData.id,
        title: 'Appointment Booked',
        message: `Your appointment with ${selectedDoctor.name} is booked for ${formatInUserTimezone(
          appointmentUtcTime.toISOString(),
          "EEEE, MMMM d 'at' h:mm a zzz",
          userTimezone
        )}.`,
        read: false,
      });

      if (notificationResult.error) {
        console.error('Notification insert error:', notificationResult.error);
        // You can choose whether to throw here or just log
      }

      const reminderResult = await supabase.from('reminders').insert({
        user_id: user?.id,
        appointment_id: insertData.id,
        title: 'Reminder: Appointment Soon',
        due_date: reminderTime.toISOString(),
        description: `Reminder: Your appointment with ${selectedDoctor.name} is in 1 hour.`,
        priority: 'medium',
        sent: false,
      });

      if (reminderResult.error) {
        console.error('Reminder insert error:', reminderResult.error);
        // Similarly, decide if you want to throw or not
      }

      toast.success('Appointment booked successfully!');

      // Reset form
      setSelectedSlot(null);
      setNotes('');
      await loadTimeSlots(); // Refresh slots to show the newly booked slot

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const isDayAvailable = (date: Date) => {
    if (!selectedDoctor) return false;
    
    const dayOfWeek = WEEKDAYS[getDay(date)];
    const dateString = format(date, 'yyyy-MM-dd');
    const today = getTodayString(userTimezone);
    
    return selectedDoctor.available_days.includes(dayOfWeek) && dateString >= today;
  };

  const renderCalendar = () => {
    const days = getCalendarDays();
    const today = getTodayString(userTimezone);

    return (
      <div className="calendar">
        <div className="calendar__header">
          <button 
            onClick={() => navigateMonth('prev')}
            className="calendar__nav"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
          <button 
            onClick={() => navigateMonth('next')}
            className="calendar__nav"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar__weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar__weekday">{day}</div>
          ))}
        </div>

        <div className="calendar__days">
          {/* Empty cells for days before month start */}
          {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar__day calendar__day--empty" />
          ))}
          
          {days.map(day => {
            const dateString = format(day, 'yyyy-MM-dd');
            const isSelected = dateString === selectedDate;
            const isAvailable = isDayAvailable(day);
            const isToday = dateString === today;

            return (
              <button
                key={dateString}
                onClick={() => isAvailable ? handleDateSelect(dateString) : null}
                className={`calendar__day ${
                  isSelected ? 'selected' : ''
                } ${isAvailable ? 'available' : 'unavailable'} ${
                  isToday ? 'today' : ''
                }`}
                disabled={!isAvailable}
              >
                <span className="calendar__day-number">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="book-appointment">
      <Toaster position="top-right" />
      
      <div className="book-appointment__header">
        <div className="book-appointment__title ">
          <h1>Book Appointment</h1>
        </div>
        <p>Schedule your appointment with our qualified medical professionals</p>
        <div className="timezone-info">
          <Clock size={16} />
          <span>Your timezone: {timezoneInfo.name} ({timezoneInfo.offset})</span>
        </div>
      </div>

      <div className="book-appointment__content">
        {/* Doctor Selection */}
        <section className="book-appointment__section">
          <h2>
            <p className='d-flex justify-content-center align-items-center'><LucidUser className="section-icon mr-2" />
            Select a Doctor</p>
          </h2>
          
          {loadingDoctors ? (
            <div className="loading">Loading doctors...</div>
          ) : (
            <div className="doctor_grid">
              {doctors.map(doctor => (
                <div
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={`doctor-card ${
                    selectedDoctor?.id === doctor.id ? 'selected' : ''
                  }`}
                >
                  <div className="doctor-card__image">
                    {doctor.profile_image_url ? (
                      <img src={doctor.profile_image_url} alt={doctor.name} />
                    ) : (
                      <div className="doctor-card__placeholder">
                        <LucidUser size={24} />
                      </div>
                    )}
                  </div>
                  <div className="doctor-card__info">
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                    {doctor.location && (
                      <div className="doctor-card__location">
                        <MapPin size={14}  aria-hidden="true"/>
                        <span>{doctor.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="doctor-card__schedule">
                    <Clock size={14} aria-hidden="true"/>
                    <span>{doctor.working_hours.start} - {doctor.working_hours.end}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="middle-appointment">

        {/* Calendar */}
        {selectedDoctor && (
          <section className="book-appointment__section">
            <h2>
              <p className='d-flex justify-content-center align-items-center'><Calendar className="section-icon mr-2" aria-hidden="true" />
              Select Date</p>
            </h2>
            <div className="calendar-section">
              {renderCalendar()}
            </div>
            
          </section>
        )}

        {/* Time Slots */}
        {selectedDate && (
          <section className="book-appointment__section">
          <h2>
            <p className="d-flex justify-content-center align-items-center">
              <Clock className="section-icon mr-2" /> Available Times for:
            </p>
            <p className="text-primary form-text ml-6">
              {formatDateForDisplay(parseISO(selectedDate + 'T00:00:00'), userTimezone)}
            </p>
          </h2>

          {loadingSlots ? (
            <div className="loading">Loading available times...</div>
          ) : timeSlots.length === 0 ? (
            <p className="no-slots">No available time slots for this date.</p>
          ) : (
            <div className="time-slots">
              {timeSlots.map((slot, index) => {
                const isSelected = selectedSlot?.utcDateTime === slot.utcDateTime;
                return (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.isBooked || slot.isPast}
                    className={`slot 
                      ${isSelected ? 'selected' : ''} 
                      ${slot.isBooked || slot.isPast ? 'unavailable' : ''}`}
                  >
                    {formatTimeForDisplay(slot.localDateTime, userTimezone)}
                    {slot.isBooked && <span className="slot-status"> (Booked)</span>}
                    {slot.isPast && <span className="slot-status"> (Past)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        )}
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <section className="book-appointment__section">
            <h2>Complete Booking</h2>
            
            <div className="booking-summary">
              <h3>Appointment Summary</h3>
              <div className="summary-item">
                <span>Doctor:</span>
                <strong>{selectedDoctor?.name}</strong>
              </div>
              <div className="summary-item">
                <span>Specialty:</span>
                <strong>{selectedDoctor?.specialty}</strong>
              </div>
              <div className="summary-item">
                <span>Date:</span>
                <strong>{formatDateForDisplay(selectedSlot.localDateTime, userTimezone)}</strong>
              </div>
              <div className="summary-item">
                <span>Time:</span>
                <strong>{formatTimeForDisplay(selectedSlot.localDateTime, userTimezone)} ({timezoneInfo.abbreviation})</strong>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or reason for visit (optional)"
              className="notes-textarea"
              rows={4}
            />

            <button
              onClick={handleBookAppointment}
              disabled={isBooking}
              className="book-button"
            >
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;