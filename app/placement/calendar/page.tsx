"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  CalendarEvent,
  EventFormData,
} from "@/api/events";
import EventForm from "@/components/EventForm";

type EventType = CalendarEvent["type"];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  ALUMNI_MEET: "Alumni Meet",
  PLACEMENT_DRIVE: "Placement Drive",
  WORKSHOP: "Workshop",
  GUEST_LECTURE: "Guest Lecture",
  TALK: "Talk",
  WEBINAR: "Webinar",
  OTHER: "Other",
};

type FormMode = "view" | "add" | "edit";

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formMode, setFormMode] = useState<FormMode>("view");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Fetch events with React Query
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setFormMode("view");
      showToast("Event created successfully!", "success");
    },
    onError: (error) => {
      showToast(`Failed to create event: ${error.message}`, "error");
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventFormData }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setFormMode("view");
      setEditingEvent(null);
      showToast("Event updated successfully!", "success");
    },
    onError: (error) => {
      showToast(`Failed to update event: ${error.message}`, "error");
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowDeleteModal(false);
      setEventToDelete(null);
      showToast("Event deleted successfully!", "success");
    },
    onError: (error) => {
      showToast(`Failed to delete event: ${error.message}`, "error");
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (activeFilters.size === 0) return true;
    return activeFilters.has(event.type);
  });

  const selectedDateEvents = filteredEvents.filter((event) =>
    isSameDay(parseISO(event.event_datetime), selectedDate)
  );

  const getUrgencyColor = (eventDate: string): string => {
    const daysUntil = differenceInDays(parseISO(eventDate), new Date());
    if (daysUntil < 0) return "border-gray-300";
    if (daysUntil <= 3) return "border-error border-2";
    if (daysUntil <= 7) return "border-warning border-2";
    return "border-success border-2";
  };

  const getEventTypeColor = (type: EventType): string => {
    switch (type) {
      case "PLACEMENT_DRIVE":
        return "badge-primary";
      case "WORKSHOP":
        return "badge-secondary";
      case "ALUMNI_MEET":
        return "badge-accent";
      case "GUEST_LECTURE":
        return "badge-info";
      case "TALK":
        return "badge-warning";
      case "WEBINAR":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    if (formMode !== "view") {
      setFormMode("view");
      setEditingEvent(null);
    }
  };

  const handleAddEventClick = () => {
    setFormMode("add");
    setEditingEvent(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormMode("edit");
  };

  const handleDeleteClick = (eventId: number) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
  };

  const handleFormSubmit = (data: EventFormData) => {
    if (formMode === "add") {
      createMutation.mutate(data);
    } else if (formMode === "edit" && editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    }
  };

  const handleFormCancel = () => {
    setFormMode("view");
    setEditingEvent(null);
  };

  const toggleFilter = (type: EventType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
  };

  const showToast = (message: string, type: "success" | "error") => {
    // You can replace this with your preferred toast library
    const toast = document.createElement("div");
    toast.className = `alert ${type === "success" ? "alert-success" : "alert-error"
      } fixed top-4 right-4 w-96 z-50`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-6 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>Failed to load events. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Calendar of Events</h1>
            <p className="text-sm text-base-content/70 mt-1">
              Manage and view upcoming events
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-outline gap-2 ${activeFilters.size > 0 ? "btn-primary" : ""
                }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters.size > 0 && (
                <span className="badge badge-sm">{activeFilters.size}</span>
              )}
            </button>
            {formMode === "view" && (
              <button
                onClick={handleAddEventClick}
                className="btn btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Filter by Event Type</h3>
                {activeFilters.size > 0 && (
                  <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type as EventType)}
                    className={`btn btn-sm ${activeFilters.has(type as EventType)
                        ? "btn-primary"
                        : "btn-outline"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6">
          {/* CALENDAR GRID */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              {/* Calendar Header */}
              <div className="bg-primary text-primary-content p-4 flex items-center justify-center gap-8 rounded-t-2xl">
                <button
                  onClick={prevMonth}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold uppercase tracking-wide">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={nextMonth}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center py-3 text-xs font-semibold border-r last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {isLoading ? (
                  <div className="col-span-7 flex items-center justify-center py-20">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  days.map((day, dayIdx) => {
                    const dayEvents = filteredEvents.filter((e) =>
                      isSameDay(parseISO(e.event_datetime), day)
                    );
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={dayIdx}
                        onClick={() => handleDayClick(day)}
                        className={`
                          relative border-r border-b p-3 cursor-pointer transition-all 
                          flex flex-col items-start justify-start min-h-[100px]
                          ${!isCurrentMonth && "bg-base-200/50 opacity-50"}
                          ${isCurrentMonth && "hover:bg-base-200"}
                          ${isSelected && "bg-primary/10 ring-2 ring-inset ring-primary"}
                          ${isToday && "bg-info/10"}
                        `}
                      >
                        <span
                          className={`
                            text-sm font-medium mb-1
                            ${!isCurrentMonth && "text-base-content/30"}
                            ${day.getDay() === 0 && isCurrentMonth && "text-error"}
                            ${isToday && "badge badge-info badge-sm"}
                          `}
                        >
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && isCurrentMonth && (
                          <div className="w-full space-y-1 mt-1">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <div
                                key={i}
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getEventTypeColor(
                                  e.type
                                )} badge badge-xs`}
                                title={e.title}
                              >
                                {e.title.slice(0, 12)}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-base-content/50">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="card bg-base-100 shadow-xl h-fit">
            <div className="card-body">
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {format(selectedDate, "EEEE, MMM dd, yyyy")}
                </h3>
              </div>

              {formMode === "add" || formMode === "edit" ? (
                <EventForm
                  initialData={editingEvent || undefined}
                  selectedDate={selectedDate}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              ) : (
                // VIEW MODE - Events List
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      Events ({selectedDateEvents.length})
                    </h4>
                    {activeFilters.size > 0 && (
                      <span className="badge badge-primary badge-sm">
                        Filtered
                      </span>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  ) : selectedDateEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                      <p className="text-base-content/60 mb-3">
                        No events scheduled
                      </p>
                      <button
                        onClick={handleAddEventClick}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Event
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => {
                        // Filter out null URLs
                        const validImageUrls = event.images_signed_urls?.filter((url): url is string => url !== null) || [];
                        const validAttachmentUrls = event.attachments_signed_urls?.filter((url): url is string => url !== null) || [];

                        return (
                          <div
                            key={event.id}
                            className={`card bg-base-100 border ${getUrgencyColor(
                              event.event_datetime
                            )} hover:shadow-lg transition-shadow`}
                          >
                            <div className="card-body p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-base">
                                    {event.title}
                                  </h5>
                                  <span
                                    className={`badge ${getEventTypeColor(
                                      event.type
                                    )} badge-sm mt-2`}
                                  >
                                    {EVENT_TYPE_LABELS[event.type]}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditEvent(event)}
                                    className="btn btn-ghost btn-xs btn-circle"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(event.id)}
                                    className="btn btn-ghost btn-xs btn-circle text-error"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {event.details && (
                                <p className="text-sm text-base-content/70 mt-2">
                                  {event.details}
                                </p>
                              )}

                              {/* Images Preview */}
                              {validImageUrls.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex gap-2 items-center mb-1">
                                    <ImageIcon className="w-3 h-3" />
                                    <span className="text-xs text-base-content/60">
                                      {validImageUrls.length} image(s)
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Attachments */}
                              {validAttachmentUrls.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex gap-2 items-center">
                                    <FileText className="w-3 h-3" />
                                    <span className="text-xs text-base-content/60">
                                      {validAttachmentUrls.length} attachment(s)
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <p className="text-xs text-base-content/60">
                                  {format(parseISO(event.event_datetime), "h:mm a")}
                                </p>
                                <div className="text-xs">
                                  {differenceInDays(
                                    parseISO(event.event_datetime),
                                    new Date()
                                  ) >= 0 ? (
                                    <span className="badge badge-sm">
                                      {differenceInDays(
                                        parseISO(event.event_datetime),
                                        new Date()
                                      ) === 0
                                        ? "Today"
                                        : `${differenceInDays(
                                          parseISO(event.event_datetime),
                                          new Date()
                                        )} days away`}
                                    </span>
                                  ) : (
                                    <span className="badge badge-ghost badge-sm">
                                      Past
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card bg-base-100 shadow-lg mt-6">
          <div className="card-body p-4">
            <h4 className="font-semibold mb-3">Urgency Legend</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 border-2 border-error rounded"></div>
                <span className="text-sm">≤ 3 days (Urgent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 border-2 border-warning rounded"></div>
                <span className="text-sm">4-7 days (Soon)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 border-2 border-success rounded"></div>
                <span className="text-sm">&gt; 7 days (Upcoming)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !deleteMutation.isPending && setShowDeleteModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
