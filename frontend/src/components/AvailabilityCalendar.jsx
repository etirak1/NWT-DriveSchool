import React, { useState } from 'react';

const DAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function getWeekDates(baseDate) {
    const monday = new Date(baseDate);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

export default function AvailabilityCalendar({ instructor, sessions = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('week');

    const weekDates = getWeekDates(currentDate);

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };
    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const isSessionAt = (date, hour) => {
        const dateStr = date.toISOString().slice(0, 10);
        return sessions.some(s => s.date === dateStr && s.hour === hour);
    };

    const isToday = (date) => date.toDateString() === new Date().toDateString();

    return (
        <div className="calendar-wrap">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button className="btn btn-ghost btn-sm" onClick={prevWeek}>‹</button>
                    <span className="calendar-range">
            {weekDates[0].toLocaleDateString('bs-BA', { day: '2-digit', month: 'long' })}
                        {' — '}
                        {weekDates[6].toLocaleDateString('bs-BA', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
                    <button className="btn btn-ghost btn-sm" onClick={nextWeek}>›</button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>Danas</button>
            </div>

            <div className="calendar-grid">
                {/* Header row */}
                <div className="cal-cell cal-header cal-time-col" />
                {weekDates.map((d, i) => (
                    <div key={i} className={`cal-cell cal-header ${isToday(d) ? 'today' : ''}`}>
                        <span className="cal-day-name">{DAYS[i]}</span>
                        <span className="cal-day-num">{d.getDate()}</span>
                    </div>
                ))}

                {/* Hour rows */}
                {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="cal-cell cal-time">{hour}</div>
                        {weekDates.map((d, di) => {
                            const hasSession = isSessionAt(d, hour);
                            return (
                                <div
                                    key={di}
                                    className={`cal-cell cal-slot ${hasSession ? 'slot-busy' : 'slot-free'} ${isToday(d) ? 'today-col' : ''}`}
                                    title={hasSession ? 'Zauzeto' : 'Slobodno'}
                                >
                                    {hasSession && <span className="slot-label">Čas</span>}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div className="calendar-legend">
                <span className="legend-item"><span className="legend-dot dot-free" /> Slobodno</span>
                <span className="legend-item"><span className="legend-dot dot-busy" /> Zauzeto</span>
            </div>
        </div>
    );
}