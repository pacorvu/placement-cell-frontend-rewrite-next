"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import Link from "next/link";
import { Calendar, FileText, Image, Paperclip, X } from "lucide-react";
// ==================== SCHEMAS ====================
const eventSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  type: z.string(),
  details: z.string(),
  event_datetime: z.string().datetime(),
  images: z.array(z.string()),
  attachments: z.array(z.string()),
  images_signed_urls: z.array(z.string()),
  attachments_signed_urls: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const getEventsResponseSchema = z.array(eventSchema);

type Event = z.infer<typeof eventSchema>;
type GetEventsResponse = z.infer<typeof getEventsResponseSchema>;

// ==================== CONSTANTS ====================
const EVENT_TYPE_BADGE: Record<string, string> = {
  ALUMNI_MEET: "badge-accent",
  WORKSHOP: "badge-info",
  SEMINAR: "badge-success",
  COMPETITION: "badge-warning",
  CULTURAL: "badge-secondary",
  SPORTS: "badge-primary",
  HACKATHON: "badge-error",
  GUEST_LECTURE: "badge-ghost",
};

function formatEventType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date();
}

// Total attachments = images + attachments combined
function getTotalAttachments(event: Event): number {
  return event.images_signed_urls.length + event.attachments_signed_urls.length;
}

// ==================== COLUMN HELPER ====================
const columnHelper = createColumnHelper<Event>();

// ==================== EVENT MODAL ====================
interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!isOpen) return null;

  // Merge all signed URLs into one list with a type tag
  const allAttachments = [
    ...event.images_signed_urls.map((url, idx) => ({
      url,
      label: `Image ${idx + 1}`,
      icon: Image,  // component reference, not JSX
    })),
    ...event.attachments_signed_urls.map((url, idx) => ({
      url,
      label: `Attachment ${idx + 1}`,
      icon: FileText,
    })),
  ];

  const badgeClass = EVENT_TYPE_BADGE[event.type] || "badge-ghost";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="card-body pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold">{event.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`badge ${badgeClass}`}>
                    {formatEventType(event.type)}
                  </span>
                  <span className="text-sm opacity-50">
                    {formatDate(event.event_datetime)} at {formatTime(event.event_datetime)}
                  </span>
                  {isUpcoming(event.event_datetime) && (
                    <span className="badge badge-success badge-sm">Upcoming</span>
                  )}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={onClose}>
                <X className="w-4 h-4" />

              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="card-body pt-0 overflow-y-auto space-y-5">
            {/* Details Section */}
            <div>
              <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-2">
                Details
              </h4>
              <p className="text-sm leading-relaxed">
                {event.details || "No details provided."}
              </p>
            </div>

            {/* Divider */}
            {allAttachments.length > 0 && <div className="divider my-0" />}

            {/* Attachments Section */}
            {allAttachments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide">
                    Attachments
                  </h4>
                  <span className="badge badge-ghost badge-sm">
                    <Paperclip className="w-3 h-3 mr-1" /> {allAttachments.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {allAttachments.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:border-primary hover:bg-base-200 transition-colors group"
                    >
                      <item.icon className="w-5 h-5 shrink-0 opacity-60" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs opacity-40 truncate">{item.url}</div>
                      </div>
                      <span className="text-xs opacity-40 group-hover:opacity-80 transition-opacity">
                        ↗
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No attachments fallback */}
            {allAttachments.length === 0 && (
              <div>
                <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-2">
                  Attachments
                </h4>
                <p className="text-sm opacity-40">No attachments available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== MAIN COMPONENT ====================
export default function Events() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "event_datetime", desc: false },
  ]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [modalEvent, setModalEvent] = useState<Event | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await api.get<GetEventsResponse>("/events");
      return response.data;
    },
  });

  const eventTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((e) => e.type))].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (typeFilter === "all") return data;
    return data.filter((e) => e.type === typeFilter);
  }, [data, typeFilter]);

  const upcomingCount = useMemo(
    () => filteredData.filter((e) => isUpcoming(e.event_datetime)).length,
    [filteredData],
  );
  const pastCount = filteredData.length - upcomingCount;

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row, getValue }) => (
          <div>
            <div className="font-medium">{getValue()}</div>
            {isUpcoming(row.original.event_datetime) && (
              <span className="badge badge-success badge-sm mt-0.5">Upcoming</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue();
          const badgeClass = EVENT_TYPE_BADGE[type] || "badge-ghost";
          return (
            <span className={`badge ${badgeClass}`}>
              {formatEventType(type)}
            </span>
          );
        },
      }),
      columnHelper.accessor("event_datetime", {
        header: "Date & Time",
        cell: ({ getValue }) => (
          <div>
            <div className="font-medium">{formatDate(getValue())}</div>
            <div className="text-sm opacity-50">{formatTime(getValue())}</div>
          </div>
        ),
      }),
      columnHelper.accessor("details", {
        header: "Details",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="opacity-60 text-sm max-w-[200px] block truncate">
            {getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "attachments",
        header: "Attachments",
        cell: ({ row }) => {
          const total = getTotalAttachments(row.original);
          if (total === 0) {
            return <span className="opacity-30 text-sm">None</span>;
          }
          return (
            <span className="badge badge-ghost badge-sm">
              <Paperclip className="w-3 h-3 mr-1" /> {total}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setModalEvent(row.original)}
          >
            View
          </button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Events</h1>
          <p className="text-base-content/60 mt-1">
            Browse upcoming and past campus events
          </p>
        </div>

        {/* Type Filter Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-6 flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`tab ${typeFilter === "all" ? "tab-active" : ""}`}
          >
            All ({data?.length ?? 0})
          </button>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`tab ${typeFilter === type ? "tab-active" : ""}`}
            >
              {formatEventType(type)} (
              {data?.filter((e) => e.type === type).length ?? 0})
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : isError ? (
              <div className="alert alert-error m-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Error loading events: {(error as Error)?.message}
                </span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No events found
                </h3>
                <p className="text-base-content/60">
                  {typeFilter === "all"
                    ? "No events are available right now. Check back soon!"
                    : `No ${formatEventType(typeFilter)} events found. Try a different filter.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none hover:text-primary transition-colors"
                                : ""
                            }
                          >
                            <div className="flex items-center gap-1.5">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {header.column.getCanSort() && (
                                <span className="text-xs opacity-40">
                                  {header.column.getIsSorted() === "asc"
                                    ? "↑"
                                    : header.column.getIsSorted() === "desc"
                                      ? "↓"
                                      : "↕"}
                                </span>
                              )}
                            </div>
                          </th>
                        )),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-base-200 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {!isLoading && !isError && data && data.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-base-content/60">
            <span>
              Showing {filteredData.length} of {data.length} event
              {data.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-4">
              <span>
                <span className="badge badge-success badge-sm mr-1">
                  {upcomingCount}
                </span>
                upcoming
              </span>
              <span>
                <span className="badge badge-ghost badge-sm mr-1">
                  {pastCount}
                </span>
                past
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalEvent && (
        <EventModal
          event={modalEvent}
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
        />
      )}
    </div>
  );
}
