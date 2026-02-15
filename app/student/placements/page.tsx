"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, Fragment } from "react";
import { z } from "zod";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  UserCheck,
  UserX,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";

// ==================== STATUS DOMAIN ====================
const StatusEnum = z.enum(["PASSED", "FAILED", "ABSENT"]);

export type Status = z.infer<typeof StatusEnum>;

// Explicit null / unknown state
const NullableStatus = z.union([StatusEnum, z.literal(null)]);

export type NullableStatus = Status | null;

// ==================== BACKEND TRANSFORMATION ====================
// Backend sends boolean | Status | null, we transform to Status | null
const BackendStatus = z
  .union([
    z.boolean(),
    StatusEnum,
    z.null(),
  ])
  .transform((value): NullableStatus => {
    if (value === null) return null;
    if (value === true) return "PASSED";
    if (value === false) return "FAILED";
    // Already a valid Status enum
    return value;
  });

// ==================== SCHEMAS ====================
const placementRecordSchema = z.object({
  id: z.number(),
  placement_drive_id: z.number(),
  usn: z.string(),

  is_eligible: z.boolean(),

  // Transform backend booleans to Status enums
  registration_status: BackendStatus,
  approved_status: BackendStatus,
  oa_status: BackendStatus,
  gd_status: BackendStatus,
  technical_round_status: BackendStatus,
  interview_status: BackendStatus,
  hr_round_status: BackendStatus,
  final_select_status: BackendStatus,

  malpractice: z.boolean(),
  remarks: z.string().nullable(),

  created_at: z.string(),
  updated_at: z.string(),
});

const getPlacementRecordsResponse = z.array(placementRecordSchema);

type PlacementRecord = z.infer<typeof placementRecordSchema>;
type GetPlacementRecordsResponse = z.infer<typeof getPlacementRecordsResponse>;

// ==================== STATUS RESOLUTION ====================
type ResolvedStatus = { kind: "known"; value: Status } | { kind: "unknown" };

function resolveStatus(status: NullableStatus): ResolvedStatus {
  if (status === null) return { kind: "unknown" };
  return { kind: "known", value: status };
}

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG: Record<
  Status,
  { badge: string; icon: React.FC<{ className?: string }> }
> = {
  PASSED: { badge: "badge-success", icon: CheckCircle },
  FAILED: { badge: "badge-error", icon: XCircle },
  ABSENT: { badge: "badge-ghost", icon: XCircle },
};

const UNKNOWN_STATUS = {
  badge: "badge-ghost",
  icon: Clock,
  label: "Not Updated",
};

// ==================== STATUS RENDERING ====================
function renderStatus(status: NullableStatus) {
  const resolved = resolveStatus(status);

  if (resolved.kind === "unknown") {
    const Icon = UNKNOWN_STATUS.icon;
    return (
      <span className={`badge ${UNKNOWN_STATUS.badge} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {UNKNOWN_STATUS.label}
      </span>
    );
  }

  const config = STATUS_CONFIG[resolved.value];
  const Icon = config.icon;

  return (
    <span className={`badge ${config.badge} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {resolved.value}
    </span>
  );
}

// ==================== HELPER FUNCTIONS ====================
type FilterType = "all" | "registered" | "unregistered";

function isRegistered(record: PlacementRecord): boolean {
  return record.registration_status === "PASSED";
}

// ==================== COLUMN HELPER ====================
const columnHelper = createColumnHelper<PlacementRecord>();

// ==================== EXPANDABLE ROW CONTENT ====================
interface ExpandedRowProps {
  record: PlacementRecord;
  onRegister?: (driveId: number) => void;
  isRegistering?: boolean;
}

function ExpandedRowContent({
  record,
  onRegister,
  isRegistering,
}: ExpandedRowProps) {
  const statusSections: Array<{ label: string; value: NullableStatus }> = [
    { label: "Registration", value: record.registration_status },
    { label: "Approval", value: record.approved_status },
    { label: "Online Assessment", value: record.oa_status },
    { label: "Group Discussion", value: record.gd_status },
    { label: "Technical Round", value: record.technical_round_status },
    { label: "Interview", value: record.interview_status },
    { label: "HR Round", value: record.hr_round_status },
    { label: "Final Selection", value: record.final_select_status },
  ];

  return (
    <div className="bg-base-200 p-6 space-y-5">
      {/* Eligibility & Malpractice */}
      <div className="flex gap-4">
        <div
          className={`alert ${record.is_eligible ? "alert-success" : "alert-warning"}`}
        >
          {record.is_eligible ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">
            {record.is_eligible ? "Eligible" : "Not Eligible"}
          </span>
        </div>
        {record.malpractice && (
          <div className="alert alert-error">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Malpractice Detected</span>
          </div>
        )}
      </div>

      {/* All Statuses Grid */}
      <div>
        <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
          Process Stages
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusSections.map((section) => (
            <div key={section.label} className="bg-base-100 rounded-lg p-3">
              <div className="text-xs opacity-50 mb-1.5">{section.label}</div>
              {renderStatus(section.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Remarks */}
      {record.remarks && (
        <div>
          <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-2">
            Remarks
          </h4>
          <p className="text-sm leading-relaxed bg-base-100 rounded-lg p-3">
            {record.remarks}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center text-xs opacity-40 pt-2 border-t border-base-300">
        {/* Register Button for Unregistered */}
        {!isRegistered(record) && (
          <div className="pt-2">
            <button
              className="btn btn-primary"
              onClick={() => onRegister?.(record.placement_drive_id)}
              disabled={isRegistering || !record.is_eligible}
            >
              {isRegistering && <span className="loading loading-spinner"></span>}
              Register for this Drive
            </button>
            {!record.is_eligible && (
              <p className="text-xs opacity-50 mt-2">
                You are not eligible to register for this drive
              </p>
            )}
          </div>
        )}

        {/* Meta */}
        <span>
          Created{" "}
          {new Date(record.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function PlacementProcessTable() {
  const userId: number = parseInt(localStorage.getItem("user_id") ?? "0");
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Fetch placement records
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryKey: ["placement-process", userId],
    queryFn: async () => {
      const response = await api.get(`/process/user/${userId}`);
      // ✓ CRITICAL: Actually parse through Zod to run transformations
      return getPlacementRecordsResponse.parse(response.data);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (placementDriveId: number) => {
      const response = await api.post(`/process/register/${placementDriveId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["placement-process", userId],
      });
    },
  });

  // Counts per filter
  const counts = useMemo(() => {
    if (!data) return { all: 0, registered: 0, unregistered: 0 };
    return {
      all: data.length,
      registered: data.filter((r) => isRegistered(r)).length,
      unregistered: data.filter((r) => !isRegistered(r)).length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (activeFilter === "all") return data;
    if (activeFilter === "registered")
      return data.filter((r) => isRegistered(r));
    return data.filter((r) => !isRegistered(r));
  }, [data, activeFilter]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expander",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => row.toggleExpanded()}
            className="btn btn-ghost btn-xs btn-circle"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ),
      }),
      columnHelper.accessor("placement_drive_id", {
        header: "Drive ID",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 opacity-40" />
            <span className="font-medium">Drive #{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("registration_status", {
        header: "Registration",
        cell: ({ getValue }) => renderStatus(getValue()),
      }),
      columnHelper.accessor("approved_status", {
        header: "Approval",
        cell: ({ getValue }) => renderStatus(getValue()),
      }),
      columnHelper.accessor("final_select_status", {
        header: "Final Status",
        cell: ({ getValue }) => renderStatus(getValue()),
      }),
      columnHelper.accessor("is_eligible", {
        header: "Eligible",
        cell: ({ getValue }) => {
          const eligible = getValue();
          return eligible ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <XCircle className="w-5 h-5 text-error opacity-40" />
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Placement Process
          </h1>
          <p className="text-base-content/60 mt-1">
            Track your placement drive registrations and progress
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`tab flex items-center gap-1.5 ${activeFilter === "all" ? "tab-active" : ""}`}
          >
            <Briefcase className="w-4 h-4" />
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter("registered")}
            className={`tab flex items-center gap-1.5 ${activeFilter === "registered" ? "tab-active" : ""}`}
          >
            <UserCheck className="w-4 h-4" />
            Registered ({counts.registered})
          </button>
          <button
            onClick={() => setActiveFilter("unregistered")}
            className={`tab flex items-center gap-1.5 ${activeFilter === "unregistered" ? "tab-active" : ""}`}
          >
            <UserX className="w-4 h-4" />
            Unregistered ({counts.unregistered})
          </button>
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
                <span>
                  Error loading placement records: {(error as Error)?.message}
                </span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No {activeFilter !== "all" ? activeFilter : ""} drives found
                </h3>
                <p className="text-base-content/60">
                  {activeFilter === "all"
                    ? "Your placement drives will appear here once available."
                    : `No ${activeFilter} drives at the moment.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
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
                      <Fragment key={row.id}>
                        {/* Main Row */}
                        <tr className="hover:bg-base-200 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                        {/* Expanded Row */}
                        {row.getIsExpanded() && (
                          <tr>
                            <td colSpan={columns.length} className="p-0">
                              <ExpandedRowContent
                                record={row.original}
                                onRegister={(driveId) =>
                                  registerMutation.mutate(driveId)
                                }
                                isRegistering={registerMutation.isPending}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
              Showing {filteredData.length} of {data.length} drive
              {data.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="badge badge-success badge-sm">
                  {counts.registered}
                </span>
                registered
              </span>
              <span className="flex items-center gap-1">
                <span className="badge badge-ghost badge-sm">
                  {counts.unregistered}
                </span>
                unregistered
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
