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
import {
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Globe,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const jobOfferSchema = z.object({
  id: z.number().int(),
  usn: z.string(),
  hiring_type: z.string(),
  job_type: z.string(),
  internship_duration: z.number(),
  internship_stipend: z.number(),
  ctc_min_lpa: z.number(),
  ctc_max_lpa: z.number(),
  ctc_variable_pay: z.number(),
  designation: z.string(),
  offer_letter_status: z.string(),
  final_interview_status: z.string(),
  remarks: z.string(),
  company_id: z.number().int(),
  company_name: z.string(),
  refered_by: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const getJobOffersResponseSchema = z.array(jobOfferSchema);

type JobOffer = z.infer<typeof jobOfferSchema>;
type GetJobOffersResponse = z.infer<typeof getJobOffersResponseSchema>;

// ==================== CONSTANTS ====================
type OfferFilter = "all" | "pending" | "accepted" | "rejected";

const HIRING_TYPE_BADGE: Record<string, string> = {
  FULL_TIME: "badge-success",
  PART_TIME: "badge-info",
  CONTRACT: "badge-warning",
  INTERNSHIP: "badge-secondary",
};

const JOB_TYPE_BADGE: Record<string, string> = {
  DOMESTIC: "badge-primary",
  INTERNATIONAL: "badge-accent",
};

const OFFER_STATUS_CONFIG: Record<
  string,
  { badge: string; icon: React.FC<{ className?: string }> }
> = {
  NOT_ISSUED: { badge: "badge-warning", icon: Clock },
  PENDING: { badge: "badge-warning", icon: Clock },
  ISSUED: { badge: "badge-success", icon: CheckCircle },
  ACCEPTED: { badge: "badge-success", icon: CheckCircle },
  REJECTED: { badge: "badge-error", icon: XCircle },
};

const INTERVIEW_STATUS_CONFIG: Record<
  string,
  { badge: string; icon: React.FC<{ className?: string }> }
> = {
  PASSED: { badge: "badge-success", icon: CheckCircle },
  FAILED: { badge: "badge-error", icon: XCircle },
  PENDING: { badge: "badge-warning", icon: Clock },
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCTC(min: number, max: number, variable: number): string {
  if (min === 0 && max === 0) return "—";
  const range =
    min === max ? `${min} LPA` : `${min} - ${max} LPA`;
  return variable > 0 ? `${range} + ${variable} variable` : range;
}

// Filter classification
function getOfferFilter(offer: JobOffer): OfferFilter {
  const status = offer.offer_letter_status;
  if (status === "REJECTED") return "rejected";
  if (status === "ISSUED" || status === "ACCEPTED") return "accepted";
  return "pending"; // NOT_ISSUED, PENDING, or anything else
}

// ==================== COLUMN HELPER ====================
const columnHelper = createColumnHelper<JobOffer>();

// ==================== DETAIL MODAL ====================
interface JobOfferModalProps {
  offer: JobOffer;
  isOpen: boolean;
  onClose: () => void;
}

function JobOfferModal({ offer, isOpen, onClose }: JobOfferModalProps) {
  if (!isOpen) return null;

  const offerStatus = OFFER_STATUS_CONFIG[offer.offer_letter_status] ?? {
    badge: "badge-ghost",
    icon: Clock,
  };
  const interviewStatus = INTERVIEW_STATUS_CONFIG[offer.final_interview_status] ?? {
    badge: "badge-ghost",
    icon: Clock,
  };
  const OfferIcon = offerStatus.icon;
  const InterviewIcon = interviewStatus.icon;

  const isInternship =
    offer.hiring_type === "INTERNSHIP" ||
    offer.internship_duration > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="card-body pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 opacity-60 shrink-0" />
                  <h3 className="text-lg font-bold truncate">{offer.company_name}</h3>
                </div>
                <p className="text-sm opacity-60 mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {offer.designation}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`badge ${HIRING_TYPE_BADGE[offer.hiring_type] || "badge-ghost"}`}>
                    {formatStatus(offer.hiring_type)}
                  </span>
                  <span className={`badge ${JOB_TYPE_BADGE[offer.job_type] || "badge-ghost"}`}>
                    {offer.job_type === "INTERNATIONAL" ? (
                      <Globe className="w-3 h-3 mr-1" />
                    ) : (
                      <MapPin className="w-3 h-3 mr-1" />
                    )}
                    {formatStatus(offer.job_type)}
                  </span>
                  <span className={`badge ${offerStatus.badge}`}>
                    <OfferIcon className="w-3 h-3 mr-1" />
                    {formatStatus(offer.offer_letter_status)}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="card-body pt-0 overflow-y-auto space-y-5">
            {/* Compensation */}
            <div>
              <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Compensation
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-base-200 rounded-lg p-3">
                  <div className="text-xs opacity-50 mb-0.5">CTC</div>
                  <div className="font-semibold text-sm">
                    {formatCTC(offer.ctc_min_lpa, offer.ctc_max_lpa, 0)}
                  </div>
                </div>
                <div className="bg-base-200 rounded-lg p-3">
                  <div className="text-xs opacity-50 mb-0.5">Variable</div>
                  <div className="font-semibold text-sm">
                    {offer.ctc_variable_pay > 0 ? `${offer.ctc_variable_pay} LPA` : "—"}
                  </div>
                </div>
                {isInternship && (
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="text-xs opacity-50 mb-0.5">Stipend</div>
                    <div className="font-semibold text-sm">
                      {offer.internship_stipend > 0 ? `₹${offer.internship_stipend}/mo` : "—"}
                    </div>
                  </div>
                )}
                {!isInternship && (
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="text-xs opacity-50 mb-0.5">Total</div>
                    <div className="font-semibold text-sm">
                      {offer.ctc_max_lpa > 0
                        ? `${offer.ctc_max_lpa + offer.ctc_variable_pay} LPA`
                        : "—"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isInternship && (
              <div>
                <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Internship Details
                </h4>
                <div className="flex gap-3">
                  <div className="bg-base-200 rounded-lg p-3 flex-1">
                    <div className="text-xs opacity-50 mb-0.5">Duration</div>
                    <div className="font-semibold text-sm">
                      {offer.internship_duration > 0
                        ? `${offer.internship_duration} months`
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="divider my-0" />

            {/* Status */}
            <div>
              <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
                Status
              </h4>
              <div className="flex gap-3">
                <div className="bg-base-200 rounded-lg p-3 flex-1">
                  <div className="text-xs opacity-50 mb-1">Offer Letter</div>
                  <div className={`badge ${offerStatus.badge} flex items-center gap-1`}>
                    <OfferIcon className="w-3 h-3" />
                    {formatStatus(offer.offer_letter_status)}
                  </div>
                </div>
                <div className="bg-base-200 rounded-lg p-3 flex-1">
                  <div className="text-xs opacity-50 mb-1">Final Interview</div>
                  <div className={`badge ${interviewStatus.badge} flex items-center gap-1`}>
                    <InterviewIcon className="w-3 h-3" />
                    {formatStatus(offer.final_interview_status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {offer.remarks && (
              <>
                <div className="divider my-0" />
                <div>
                  <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Remarks
                  </h4>
                  <p className="text-sm leading-relaxed">{offer.remarks}</p>
                </div>
              </>
            )}

            {/* Meta */}
            <div className="divider my-0" />
            <div className="flex justify-between text-xs opacity-40">
              <span>Referred by: {offer.refered_by || "—"}</span>
              <span>
                Created {new Date(offer.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function JobOffersTable() {
  const userId: number = parseInt(localStorage.getItem("user_id") ?? "0");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [activeFilter, setActiveFilter] = useState<OfferFilter>("all");
  const [modalOffer, setModalOffer] = useState<JobOffer | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryKey: ["job-offers", userId],
    queryFn: async () => {
      const response = await api.get<GetJobOffersResponse>(
        `/job_offers/user/${userId}`,
      );
      return response.data;
    },
  });

  // Counts per filter
  const counts = useMemo(() => {
    if (!data) return { all: 0, pending: 0, accepted: 0, rejected: 0 };
    return {
      all: data.length,
      pending: data.filter((o) => getOfferFilter(o) === "pending").length,
      accepted: data.filter((o) => getOfferFilter(o) === "accepted").length,
      rejected: data.filter((o) => getOfferFilter(o) === "rejected").length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (activeFilter === "all") return data;
    return data.filter((o) => getOfferFilter(o) === activeFilter);
  }, [data, activeFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("company_name", {
        header: "Company",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 opacity-40 shrink-0" />
            <span className="font-medium">{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("designation", {
        header: "Designation",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 opacity-40" />
            <span>{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("hiring_type", {
        header: "Type",
        cell: ({ row, getValue }) => {
          const hiringType = getValue();
          const jobType = row.original.job_type;
          return (
            <div className="flex flex-wrap gap-1.5">
              <span className={`badge badge-sm ${HIRING_TYPE_BADGE[hiringType] || "badge-ghost"}`}>
                {formatStatus(hiringType)}
              </span>
              <span className={`badge badge-sm ${JOB_TYPE_BADGE[jobType] || "badge-ghost"}`}>
                {jobType === "INTERNATIONAL" ? (
                  <Globe className="w-3 h-3 mr-0.5" />
                ) : (
                  <MapPin className="w-3 h-3 mr-0.5" />
                )}
                {formatStatus(jobType)}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "ctc",
        header: "CTC",
        enableSorting: false,
        cell: ({ row }) => {
          const { ctc_min_lpa, ctc_max_lpa, ctc_variable_pay } = row.original;
          return (
            <div className="text-sm">
              <span className="font-medium">
                {formatCTC(ctc_min_lpa, ctc_max_lpa, 0)}
              </span>
              {ctc_variable_pay > 0 && (
                <span className="opacity-40 text-xs ml-1">+{ctc_variable_pay} var</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("offer_letter_status", {
        header: "Offer Status",
        cell: ({ getValue }) => {
          const status = getValue();
          const config = OFFER_STATUS_CONFIG[status] ?? {
            badge: "badge-ghost",
            icon: Clock,
          };
          const Icon = config.icon;
          return (
            <span className={`badge ${config.badge} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {formatStatus(status)}
            </span>
          );
        },
      }),
      columnHelper.accessor("final_interview_status", {
        header: "Interview",
        cell: ({ getValue }) => {
          const status = getValue();
          const config = INTERVIEW_STATUS_CONFIG[status] ?? {
            badge: "badge-ghost",
            icon: Clock,
          };
          const Icon = config.icon;
          return (
            <span className={`badge ${config.badge} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {formatStatus(status)}
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
            onClick={() => setModalOffer(row.original)}
          >
            View
          </button>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        enableSorting: true,
        meta: { hidden: true },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility: { created_at: false },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  }); return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Job Offers</h1>
          <p className="text-base-content/60 mt-1">
            Track your placement offers and their statuses
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-6 flex flex-wrap gap-1">
          {(
            [
              { key: "all" as OfferFilter, label: "All", icon: Briefcase },
              { key: "pending" as OfferFilter, label: "Pending", icon: Clock },
              { key: "accepted" as OfferFilter, label: "Accepted", icon: CheckCircle },
              { key: "rejected" as OfferFilter, label: "Rejected", icon: XCircle },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`tab flex items-center gap-1.5 ${activeFilter === key ? "tab-active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : isError ? (
              <div className="alert alert-error m-4">
                <XCircle className="stroke-current shrink-0 h-6 w-6" />
                <span>Error loading job offers: {(error as Error)?.message}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No {activeFilter !== "all" ? activeFilter : ""} offers found
                </h3>
                <p className="text-base-content/60">
                  {activeFilter === "all"
                    ? "Your job offers will appear here once available."
                    : `No ${activeFilter} offers at the moment. Try a different filter.`}
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
                      <tr key={row.id} className="hover:bg-base-200 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

        {/* Footer */}
        {!isLoading && !isError && data && data.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-base-content/60">
            <span>
              Showing {filteredData.length} of {data.length} offer
              {data.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="badge badge-warning badge-sm">{counts.pending}</span>
                pending
              </span>
              <span className="flex items-center gap-1">
                <span className="badge badge-success badge-sm">{counts.accepted}</span>
                accepted
              </span>
              <span className="flex items-center gap-1">
                <span className="badge badge-error badge-sm">{counts.rejected}</span>
                rejected
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOffer && (
        <JobOfferModal
          offer={modalOffer}
          isOpen={!!modalOffer}
          onClose={() => setModalOffer(null)}
        />
      )}
    </div>
  );
}
