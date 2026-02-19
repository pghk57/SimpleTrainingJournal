
import React, { useState } from 'react';
import { WorkoutSession } from '../types';
import { translations, Language } from '../translations';

interface CalendarProps {
  sessions: WorkoutSession[];
  onSelectDate: (date: string) => void;
  lang: Language;
}

export const Calendar: React.FC<CalendarProps> = ({ sessions, onSelectDate, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const t = translations[lang];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getWorkoutsForDay = (day: number) => {
    const formattedDate = formatDate(day);
    return sessions.filter(s => s.date === formattedDate);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.months[month]} {year}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-chevron-left text-slate-600 dark:text-slate-400"></i>
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-chevron-right text-slate-600 dark:text-slate-400"></i>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {t.days.map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-24 bg-slate-50/30 dark:bg-slate-800/20 rounded-lg"></div>;
            
            const dayWorkouts = getWorkoutsForDay(day);
            const hasWorkout = dayWorkouts.length > 0;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div 
                key={day} 
                onClick={() => onSelectDate(formatDate(day))}
                className={`h-24 p-2 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md ${
                  hasWorkout ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40' : 'bg-white dark:bg-slate-900'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {day}
                  </span>
                  {hasWorkout && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayWorkouts.map(w => {
                    const displayTitle = (w.title && w.title !== t.workout) 
                      ? w.title 
                      : (w.exercises[0]?.name || t.workout);
                    
                    return (
                      <div key={w.id} className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded truncate font-medium">
                        {displayTitle}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
