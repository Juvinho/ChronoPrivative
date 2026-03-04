'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  posts: Array<{ id: string; createdAt: string }>;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export default function MiniCalendar({
  posts,
  onDateSelect,
  selectedDate,
}: MiniCalendarProps) {
  const [displayDate, setDisplayDate] = useState(new Date());

  // Count posts per day
  const postsByDate = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [posts]);

  // Get days in month
  const daysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sun, 1 = Mon, etc)
  const firstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onDateSelect(selected);
  };

  const getDayPostCount = (day: number): number => {
    const key = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return postsByDate.get(key) || 0;
  };

  const monthName = displayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const firstDay = firstDayOfMonth(displayDate);
  const daysCount = daysInMonth(displayDate);
  const prevMonthDays = firstDayOfMonth(displayDate);

  let dayNumber = 1;
  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; postCount: number }> = [];

  // Previous month's days (faded)
  const prevDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), 0);
  const prevMonthDaysCount = prevDate.getDate();
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDaysCount - i,
      isCurrentMonth: false,
      postCount: 0,
    });
  }

  // Current month's days
  for (let i = 1; i <= daysCount; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      postCount: getDayPostCount(i),
    });
  }

  // Next month's days (faded)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      postCount: 0,
    });
  }

  return (
    <div className="border border-[#9400FF] rounded-lg p-4 bg-[#0A0015]/50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-[#9400FF]">📅 MINICALENDÁRIO</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 border border-[#9400FF] rounded hover:border-[#00FF00] hover:text-[#00FF00] transition-colors text-[#9400FF]"
            title="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400 w-24 text-center">{monthName}</span>
          <button
            onClick={handleNextMonth}
            className="p-1 border border-[#9400FF] rounded hover:border-[#00FF00] hover:text-[#00FF00] transition-colors text-[#9400FF]"
            title="Próximo mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div
            key={day}
            className="text-center text-xs font-bold text-[#9400FF] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, idx) => {
          const isCurrentMonth = dayObj.isCurrentMonth;
          const hasPost = dayObj.postCount > 0;
          const isSelected = selectedDate &&
            selectedDate.getFullYear() === displayDate.getFullYear() &&
            selectedDate.getMonth() === displayDate.getMonth() &&
            selectedDate.getDate() === dayObj.day &&
            isCurrentMonth;

          return (
            <button
              key={idx}
              onClick={() => isCurrentMonth && handleDateClick(dayObj.day)}
              disabled={!isCurrentMonth}
              className={`
                aspect-square text-xs rounded flex items-center justify-center relative
                transition-all duration-200 font-semibold
                ${isCurrentMonth ? 'cursor-pointer' : 'cursor-default opacity-30'}
                ${isSelected
                  ? 'border-2 border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00]'
                  : isCurrentMonth
                    ? hasPost
                      ? 'bg-[#9400FF]/30 border border-[#9400FF] text-white hover:border-[#00FF00] hover:text-[#00FF00]'
                      : 'border border-[#9400FF]/30 text-gray-400 hover:border-[#9400FF] hover:text-[#9400FF]'
                    : 'text-gray-600'
                }
              `}
              title={isCurrentMonth && hasPost ? `${dayObj.postCount} post(s)` : ''}
            >
              {dayObj.day}
              {hasPost && isCurrentMonth && (
                <span className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-[#00FF00] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-[#9400FF]/30 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00FF00] rounded-full" />
          <span>Posts neste dia</span>
        </div>
        <div className="text-right">
          <p>Total: {posts.length} posts</p>
        </div>
      </div>
    </div>
  );
}
