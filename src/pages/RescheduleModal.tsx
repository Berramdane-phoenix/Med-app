import { useEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";

type Slot = { 
  dateTime: string; 
  booked: boolean;
  isPast: boolean;
  isAvailable: boolean;
};

interface RescheduleModalProps {
    doctorId: string;
    calendarDays: Date[];
    calendarMonth: number;
    calendarYear: number;
    today: Date;
    slots: Slot[];
    selectedDay: string;
    selectedSlotDateTime: string;
    loadingSlots: boolean;
    showDayValidationError: boolean;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleDaySelection: (dateStr: string) => void;
    setSelectedSlotDateTime: (dateTime: string) => void;
    setNewDateTime: (dateTime: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export default function RescheduleModal({
    calendarDays,
    calendarMonth,
    calendarYear,
    today,
    slots,
    selectedDay,
    selectedSlotDateTime,
    loadingSlots,
    showDayValidationError,
    handlePrevMonth,
    handleNextMonth,
    handleDaySelection,
    setSelectedSlotDateTime,
    setNewDateTime,
    onClose,
    onSubmit,
}: RescheduleModalProps) {
    const modalRef = useRef(null);
    const firstFocusableRef = useRef(null);
    const lastFocusableRef = useRef(null);

    // Optional: trap focus or handle escape key here

    return (
        <>
        {/* Backdrop */}
        <div className="modal-backdrop show" onClick={onClose} aria-hidden="true" />

        {/* Modal */}
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            className="modal show"
            ref={modalRef}
        >
            <div className="modal__dialog">
            <header className="modal__header">
                <h2 id="modal-title">Reschedule Appointment</h2>
                <button type="button" className="close" aria-label="Close modal" onClick={onClose}>
                &times;
                </button>
            </header>

            <section className="modal__body">
                <p id="modal-desc" className="sr-only">
                Use arrow buttons to change month. Select a day and then select an available time slot. Press Escape to close.
                </p>

                <div className="controls" aria-label="Month navigation">
                <button onClick={handlePrevMonth} className="btn" aria-label="Previous month" ref={firstFocusableRef}>
                    ‹
                </button>
                <span aria-live="polite" aria-atomic="true">
                    {format(new Date(calendarYear, calendarMonth), "MMMM yyyy")}
                </span>
                <button onClick={handleNextMonth} className="btn" aria-label="Next month" ref={lastFocusableRef}>
                    ›
                </button>
                </div>

                <table className="calendar-table" role="grid" aria-labelledby="modal-title">
                <thead>
                    <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <th key={day} scope="col">
                        {day}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: calendarDays.length / 7 }).map((_, weekIdx) => (
                    <tr key={weekIdx} role="row">
                        {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => {
                        const dayStr = format(day, "yyyy-MM-dd");
                        const isCurrentMonth = day.getMonth() === calendarMonth;
                        const isPastDay = day < today && !isSameDay(day, today);
                        const isSelected = selectedDay === dayStr;

                        return (
                            <td key={dayStr} role="gridcell">
                            <button
                                type="button"
                                disabled={isPastDay || !isCurrentMonth}
                                aria-selected={isSelected}
                                className={`day ${isSelected ? "selected" : ""} ${
                                !isCurrentMonth ? "not-current-month" : ""
                                } ${isPastDay ? "unavailable" : ""}`}
                                onClick={() => handleDaySelection(dayStr)}
                            >
                                {day.getDate()}
                            </button>
                            </td>
                        );
                        })}
                    </tr>
                    ))}
                </tbody>
                </table>

                {showDayValidationError && <p className="error-text">Please select a valid day in the current month.</p>}

                <h3>Available Time Slots</h3>
                {loadingSlots ? (
                <p className="form-text">Loading slots...</p>
                ) : selectedDay ? (
                slots.length === 0 ? (
                    <p className="form-text no-slots-text">No available slots for this day.</p>
                ) : (
                    <ul className="slots-list" role="list" aria-label={`Available time slots for ${selectedDay}`}>
                    {slots.map(({ dateTime, booked, isPast, isAvailable }) => (
                        <li key={dateTime}>
                        <button
                            type="button"
                            disabled={!isAvailable}
                            aria-pressed={selectedSlotDateTime === dateTime}
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedSlotDateTime(dateTime); 
                                setNewDateTime(dateTime);
                              }
                            }}
                            aria-label={`${format(new Date(dateTime), "p")}${
                              booked ? " (booked)" : isPast ? " (past)" : ""
                            }`}
                            className={`slot-button ${
                              selectedSlotDateTime === dateTime ? "selected" : ""
                            } ${
                              !isAvailable ? "unavailable" : ""
                            } ${
                              booked ? "booked" : ""
                            } ${
                              isPast ? "past" : ""
                            }`}
                        >
                            {format(new Date(dateTime), "h:mm a")}
                            {booked && <span className="slot-status"> (Booked)</span>}
                            {isPast && <span className="slot-status"> (Past)</span>}
                        </button>
                        </li>
                    ))}
                    </ul>
                )
                ) : (
                  <p className="form-text">Please select a day to view available time slots.</p>
                )}
            </section>

            <footer className="modal__footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
                </button>
                <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onSubmit}
                disabled={!selectedSlotDateTime}
                aria-disabled={!selectedSlotDateTime}
                >
                Confirm Reschedule
                </button>
            </footer>
            </div>
        </div>
        </>
    );
}