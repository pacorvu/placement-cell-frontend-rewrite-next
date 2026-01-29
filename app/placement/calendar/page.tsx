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
  startOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "Placement Drive" | "Deadline" | "Meeting";
  description?: string;
  remarks?: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Google Placement Drive",
    date: new Date(2026, 0, 26),
    type: "Placement Drive",
    description: "On-campus recruitment drive for SDE roles.",
  },
  {
    id: "2",
    title: "Resume Submission Deadline",
    date: new Date(2026, 0, 28),
    type: "Deadline",
    description: "Submit final resume for Google drive.",
  },
  {
    id: "3",
    title: "Mock Interviews",
    date: new Date(2026, 1, 10),
    type: "Meeting",
    description: "Mock interviews with alumni.",
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 2));
  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Placement Drive" as CalendarEvent["type"],
    startHour: "12",
    startMinute: "39",
    amPm: "AM" as "AM" | "PM",
    description: "",
    remarks: "",
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    if (isAddingEvent) {
      // Update the form date when clicking a new date while adding
      setFormData({ ...formData });
    }
  };

  const handleAddEventClick = () => {
    setIsAddingEvent(true);
    setFormData({
      title: "",
      type: "Placement Drive",
      startHour: "12",
      startMinute: "39",
      amPm: "AM",
      description: "",
      remarks: "",
    });
  };

  const handleCancel = () => {
    setIsAddingEvent(false);
  };

  const handleSave = () => {
    const today = startOfDay(new Date());

    if (!formData.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (startOfDay(selectedDate) < today) {
      toast.error("Cannot add events to past dates.");
      return;
    }

    let hour = parseInt(formData.startHour);
    if (formData.amPm === "PM" && hour !== 12) hour += 12;
    if (formData.amPm === "AM" && hour === 12) hour = 0;

    const eventDate = setMinutes(
      setHours(selectedDate, hour),
      parseInt(formData.startMinute)
    );

    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substring(2, 9),
      title: formData.title,
      date: eventDate,
      type: formData.type,
      description: formData.description,
      remarks: formData.remarks,
    };

    setEvents([...events, newEvent]);
    setIsAddingEvent(false);
    toast.success("Event added successfully!");
  };

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "Placement Drive":
        return "bg-blue-500";
      case "Deadline":
        return "bg-red-500";
      case "Meeting":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Calendar of Events
            </h1>
          </div>
          {!isAddingEvent && (
            <Button
              onClick={handleAddEventClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>

        {/* Main Grid - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
          {/* CALENDAR GRID */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-center gap-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="hover:bg-white/10 text-white h-8 w-8"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                {format(currentDate, "MMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="hover:bg-white/10 text-white h-8 w-8"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 bg-amber-100">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center py-3 text-sm font-semibold text-slate-700 border-r border-amber-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((day, dayIdx) => {
                const dayEvents = events.filter((e) => isSameDay(e.date, day));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={dayIdx}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative border-r border-b border-slate-200 p-3 cursor-pointer transition-all flex flex-col items-start justify-start min-h-[100px]",
                      !isCurrentMonth && "bg-slate-50/50",
                      isCurrentMonth && "bg-white hover:bg-slate-50",
                      isSelected && "bg-amber-50 ring-2 ring-inset ring-emerald-600",
                      isToday && "bg-blue-50"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium mb-1",
                        !isCurrentMonth && "text-slate-300",
                        isCurrentMonth && "text-slate-700",
                        day.getDay() === 0 && isCurrentMonth && "text-red-600",
                        isToday && "text-blue-600 font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && isCurrentMonth && (
                      <div className="w-full space-y-1">
                        {dayEvents.slice(0, 2).map((e, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-emerald-500"
                            title={e.title}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM SIDEBAR */}
          <div className="bg-white rounded-lg shadow overflow-hidden h-fit">
            {/* Sidebar Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800">
                {format(selectedDate, "dd-MM-yyyy")}
              </h3>
            </div>

            <div className="p-6">
              {isAddingEvent ? (
                // ADD MODE (FORM)
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 mb-4">Add Event</h4>

                  <div>
                    <Label htmlFor="title" className="text-slate-700">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder=""
                      className="mt-1.5 focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-slate-700">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as CalendarEvent["type"],
                        })
                      }
                      className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      <option value="Placement Drive">Placement Drive</option>
                      <option value="Deadline">Deadline</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-700">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <Input
                        type="text"
                        value={format(selectedDate, "dd-MM-yyyy")}
                        readOnly
                        className="bg-white cursor-default"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700">Start Time</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.startHour}
                        onChange={(e) =>
                          setFormData({ ...formData, startHour: e.target.value })
                        }
                        className="w-20"
                      />
                      <Input
                        type="text"
                        maxLength={2}
                        value={formData.startMinute}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length === 1 && parseInt(val) > 5) {
                            val = "0" + val;
                          }
                          if (val.length === 2 && parseInt(val) > 59) {
                            val = "59";
                          }
                          setFormData({ ...formData, startMinute: val });
                        }}
                        className="w-20"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant={formData.amPm === "AM" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData({ ...formData, amPm: "AM" })
                          }
                          className={
                            formData.amPm === "AM"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          AM
                        </Button>
                        <Button
                          type="button"
                          variant={formData.amPm === "PM" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData({ ...formData, amPm: "PM" })
                          }
                          className={
                            formData.amPm === "PM"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          PM
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700">Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder=""
                      rows={3}
                      className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="remarks" className="text-slate-700">Remarks</Label>
                    <textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      placeholder=""
                      rows={2}
                      className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Events</h4>
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No events scheduled</p>
                      <Button
                        variant="link"
                        onClick={handleAddEventClick}
                        className="text-emerald-600 mt-2"
                      >
                        Add one now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-slate-800">
                                {event.title}
                              </h5>
                              <span
                                className={cn(
                                  "inline-block text-xs px-2 py-0.5 rounded text-white mt-1",
                                  getEventColor(event.type)
                                )}
                              >
                                {event.type}
                              </span>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-slate-600 mt-2">
                              {event.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            {format(event.date, "h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
