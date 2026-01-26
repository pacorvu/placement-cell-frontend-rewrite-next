"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

// Mock Data
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "drive" | "deadline" | "meeting";
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Google Placement Drive",
    date: new Date(2026, 0, 26), // Jan 26, 2026 (assuming current context)
    type: "drive",
  },
  {
    id: "2",
    title: "Resume Submission Deadline",
    date: new Date(2026, 0, 28),
    type: "deadline",
  },
  {
    id: "3",
    title: "Mock Interviews",
    date: new Date(2026, 1, 10), // Feb 10
    type: "meeting",
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Default to Jan 2026 as per user context
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 26));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get events for selected date
  const selectedDateEvents = SAMPLE_EVENTS.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content">Calendar of Events</h1>
        <button className="btn btn-success text-white btn-sm gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[650px]">
        {/* CALENDAR GRID */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col w-full">
          {/* Header */}
          <div className="bg-[#2d5d4b] text-white p-4 flex justify-between items-center h-16">
            <button onClick={prevMonth} className="btn btn-ghost btn-sm btn-square text-white/70 hover:text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold uppercase tracking-widest">
              {format(currentDate, "MMM yyyy")}
            </h2>
            <button onClick={nextMonth} className="btn btn-ghost btn-sm btn-square text-white/70 hover:text-white hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 bg-[#fedc6d] text-center border-b border-gray-100 h-10 items-center">
            {weekDays.map((day) => (
              <div key={day} className="text-xs font-bold text-[#1e4620]">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-white min-h-[400px]">
            {days.map((day, dayIdx) => {
              // Check if day has events
              const dayEvents = SAMPLE_EVENTS.filter(e => isSameDay(e.date, day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSunday = day.getDay() === 0;

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative border-r border-b border-gray-100 p-2 cursor-pointer transition-all
                    flex flex-col items-center justify-start h-24 sm:h-auto
                    ${!isCurrentMonth ? "bg-white text-gray-300" : "bg-white"}
                    ${isSelected ? "border border-[#2d5d4b] ring-1 ring-[#2d5d4b] z-10" : "hover:bg-gray-50"}
                  `}
                >
                  <span className={`text-sm font-semibold mt-1
                     ${!isCurrentMonth ? "text-gray-300" : (isSunday ? "text-red-500" : "text-gray-700")}
                     ${isSelected && isCurrentMonth ? "text-[#2d5d4b]" : ""}
                  `}>
                    {format(day, "d")}
                  </span>

                  {dayEvents.length > 0 && isCurrentMonth && (
                    <div className="mt-2 flex gap-1">
                      {dayEvents.map(e => (
                        <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.type === 'drive' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR - SELECTED DATE */}
        <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-auto">
          <div className="p-6 border-b border-base-200">
            <h3 className="text-lg font-bold text-base-content">
              {format(selectedDate, "dd-MM-yyyy")}
            </h3>
            <p className="text-sm text-base-content/60 font-medium mt-1">
              Events
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center text-base-content/40 py-10">
                No events
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-3 bg-base-100 rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-sm text-base-content">{event.title}</h4>
                    <span className="text-xs text-primary uppercase font-bold tracking-wider mt-1 block">{event.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
