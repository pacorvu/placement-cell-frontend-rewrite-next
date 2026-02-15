"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownToLine,
  FileText,
  BarChart3,
  Building2,
  TrendingUp,
  Calculator,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type JobOfferResponse = {
  id: number;
  usn: string;
  company_name: string | null;
  designation: string | null;
  hiring_type: string | null;
  job_type: string | null;
  ctc_min_lpa: number | null;
  ctc_max_lpa: number | null;
  final_interview_status: string;
  offer_letter_status: string | null;
  created_at: string;
};

type JobOffersApiResponse =
  | JobOfferResponse[]
  | {
      data?: JobOfferResponse[];
      items?: JobOfferResponse[];
      results?: JobOfferResponse[];
      total?: number;
    };

const formatLpa = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} LPA`;
};

const toTitleCase = (value: string | null): string => {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeJobOffers = (payload: JobOffersApiResponse): JobOfferResponse[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
  }

  return [];
};

const toStartOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const filterByTimeline = (
  offers: JobOfferResponse[],
  fromDate: string,
  toDate: string,
) => {
  if (!fromDate && !toDate) {
    return offers;
  }

  const from = fromDate ? toStartOfDay(fromDate) : null;
  const to = toDate ? toEndOfDay(toDate) : null;

  return offers.filter((offer) => {
    if (!offer.created_at) {
      return false;
    }

    const offerDate = new Date(offer.created_at);
    if (Number.isNaN(offerDate.getTime())) {
      return false;
    }

    if (from && offerDate < from) {
      return false;
    }

    if (to && offerDate > to) {
      return false;
    }

    return true;
  });
};

const STATUS_STYLES: Record<string, string> = {
  passed: "border-success text-success",
  selected: "border-success text-success",
  accepted: "border-success text-success",
  issued: "border-success text-success",
  received: "border-info text-info",
  pending: "border-warning text-warning",
  failed: "border-error text-error",
  rejected: "border-error text-error",
  not_issued: "border-neutral text-neutral",
  withdrawn: "border-neutral text-neutral",
};

function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-base-content/60">—</span>;
  const key = value.toLowerCase();
  const style = STATUS_STYLES[key] ?? "badge-ghost";
  return (
    <span
      className={cn(
        "badge badge-sm rounded-none border bg-transparent font-semibold",
        style,
      )}
    >
      {toTitleCase(value)}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  toneClass: string;
  iconBg: string;
}

function StatCard({ title, value, icon, toneClass, iconBg }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-none border p-5 text-black shadow-sm",
        toneClass,
      )}
    >
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
            {title}
          </p>
          <p className="text-2xl font-extrabold tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-none",
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [jobOffers, setJobOffers] = useState<JobOfferResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleGenerate = async () => {
    if (fromDate && toDate && toStartOfDay(fromDate) > toEndOfDay(toDate)) {
      toast.error("From date cannot be later than To date");
      return;
    }

    const toastId = toast.loading("Generating report…");
    setIsGenerating(true);

    try {
      const response = await api.get<JobOffersApiResponse>("/job_offers/");
      const allOffers = normalizeJobOffers(response.data);
      const offers = filterByTimeline(allOffers, fromDate, toDate);

      setJobOffers(offers);
      setReportGenerated(true);
      toast.dismiss(toastId);
      toast.success(`Generated ${offers.length} job offers for selected timeline`);
    } catch {
      toast.dismiss(toastId);
      toast.error("Unable to fetch job offers report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (jobOffers.length === 0) {
      toast.error("No job offers available to export");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const generatedAt = `Generated on ${new Date().toLocaleString()}`;
    const timelineLabel =
      fromDate || toDate
        ? `Timeline: ${fromDate || "Start"} to ${toDate || "Today"}`
        : "Timeline: All dates";

    const brandPrimary: [number, number, number] = [215, 172, 84];
    const brandSecondary: [number, number, number] = [48, 72, 89];
    const ink: [number, number, number] = [28, 35, 47];
    const muted: [number, number, number] = [100, 116, 139];
    const surface: [number, number, number] = [248, 250, 252];

    doc.setFillColor(...brandSecondary);
    doc.rect(0, 0, pageW, 84, "F");
    doc.setFillColor(...brandPrimary);
    doc.rect(0, 84, pageW, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Placement Job Offers Report", 40, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(generatedAt, 40, 54);

    doc.setTextColor(...brandPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(timelineLabel, 40, 72);

    doc.setFillColor(...surface);
    doc.setDrawColor(...brandPrimary);
    doc.setLineWidth(1);
    doc.rect(40, 102, 180, 42, "FD");
    doc.rect(232, 102, 210, 42, "FD");

    doc.setTextColor(...ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Total Offers: ${jobOffers.length}`, 52, 127);
    doc.text(
      `Unique Companies: ${new Set(jobOffers.map((o) => o.company_name).filter(Boolean)).size}`,
      244,
      127,
    );

    const bodyRows = jobOffers.map((offer) => {
      const ctcText =
        offer.ctc_min_lpa !== null || offer.ctc_max_lpa !== null
          ? `${offer.ctc_min_lpa ?? "—"} – ${offer.ctc_max_lpa ?? "—"} LPA`
          : "—";

      return [
        offer.usn ?? "—",
        offer.company_name ?? "—",
        offer.designation ?? "—",
        toTitleCase(offer.hiring_type),
        toTitleCase(offer.job_type),
        ctcText,
        toTitleCase(offer.final_interview_status),
        toTitleCase(offer.offer_letter_status),
      ];
    });

    autoTable(doc, {
      startY: 158,
      head: [
        [
          "USN",
          "Company",
          "Designation",
          "Hiring",
          "Job Type",
          "CTC Range",
          "Final",
          "Offer Letter",
        ],
      ],
      body: bodyRows,
      theme: "grid",
      styles: {
        fontSize: 9.5,
        textColor: ink,
        cellPadding: 7,
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: brandSecondary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        5: { halign: "right", textColor: [22, 163, 74] },
      },
      margin: { left: 40, right: 40 },
      didDrawPage: () => {
        doc.setDrawColor(...brandPrimary);
        doc.setLineWidth(0.8);
        doc.line(40, pageH - 28, pageW - 40, pageH - 28);

        doc.setFontSize(9);
        doc.setTextColor(...muted);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          pageW - 72,
          pageH - 14,
        );
      },
    });

    doc.save("job-offers-report.pdf");
    toast.success("PDF report downloaded");
  };

  /* ---- derived stats ---- */
  const uniqueCompanies = useMemo(
    () =>
      new Set(jobOffers.map((o) => o.company_name).filter(Boolean)).size,
    [jobOffers],
  );

  const numericMaxCtc = useMemo(() => {
    const vals = jobOffers
      .map((o) => o.ctc_max_lpa)
      .filter((v): v is number => v !== null);
    return vals.length > 0 ? Math.max(...vals) : null;
  }, [jobOffers]);

  const numericAvgCtc = useMemo(() => {
    const vals = jobOffers
      .map((o) => o.ctc_max_lpa ?? o.ctc_min_lpa)
      .filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [jobOffers]);

  /* ====================== RENDER ====================== */
  return (
    <div className="bg-base-200 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl space-y-6">
        {/* ─── Page Header ─── */}
        <header className="relative overflow-hidden rounded-none border border-base-300 bg-base-100 px-6 py-5 shadow-sm">
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-primary text-primary-content">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">
                Job Offers Report
              </h1>
              <p className="text-sm text-base-content/70">
                Consolidated placement data &amp; analytics
              </p>
            </div>
          </div>
        </header>

        {/* ─── Body Grid ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* LEFT — Settings Panel */}
          <Card className="h-fit rounded-none border-base-300 bg-base-100 shadow-sm">
            <CardHeader className="border-b border-base-300 pb-3">
              <CardTitle className="text-sm font-bold text-base-content">
                Report Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="rounded-none border border-base-300 bg-base-200 p-3 text-[13px] leading-relaxed text-base-content/80">
                Generates a consolidated report for all available job offers
                with summary statistics.
              </div>
              <div className="grid grid-cols-1 gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-base-content/80">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input input-bordered input-sm w-full rounded-none"
                />
                <label className="text-xs font-semibold uppercase tracking-wide text-base-content/80">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input input-bordered input-sm w-full rounded-none"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-primary h-11 w-full rounded-none gap-2 border-0 font-semibold disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT — Preview Panel */}
          <div className="space-y-5">
            {!reportGenerated ? (
              /* ── Empty state ── */
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-none border-2 border-dashed border-base-300 bg-base-100 shadow-sm md:min-h-[380px]">
                <div className="relative mb-5">
                  <div className="absolute -inset-4 rounded-none bg-base-200" />
                  <FileText
                    className="relative h-16 w-16 text-base-content/30"
                    strokeWidth={1.2}
                  />
                </div>
                <p className="text-sm font-semibold text-base-content/60">
                  Click&nbsp;
                  <span className="text-base-content">Generate Report</span>
                  &nbsp;to fetch and preview all job offers
                </p>
              </div>
            ) : (
              /* ── Report content ── */
              <div className="space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard
                    title="Offers"
                    value={jobOffers.length}
                    icon={<FileText className="h-5 w-5" />}
                    toneClass="border-success bg-transparent"
                    iconBg="border border-success bg-transparent text-black"
                  />
                  <StatCard
                    title="Companies"
                    value={uniqueCompanies}
                    icon={<Building2 className="h-5 w-5" />}
                    toneClass="border-info bg-transparent"
                    iconBg="border border-info bg-transparent text-black"
                  />
                  <StatCard
                    title="Highest CTC"
                    value={formatLpa(numericMaxCtc)}
                    icon={<TrendingUp className="h-5 w-5" />}
                    toneClass="border-warning bg-transparent"
                    iconBg="border border-warning bg-transparent text-black"
                  />
                  <StatCard
                    title="Avg CTC"
                    value={formatLpa(numericAvgCtc)}
                    icon={<Calculator className="h-5 w-5" />}
                    toneClass="border-secondary bg-transparent"
                    iconBg="border border-secondary bg-transparent text-black"
                  />
                </div>

                {/* Data table card */}
                <Card className="overflow-hidden rounded-none border-base-300 bg-base-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-base-300 pb-4">
                    <div>
                      <CardTitle className="text-base font-bold text-base-content">
                        All Job Offers
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-base-content/70">
                        {jobOffers.length} records{fromDate || toDate ? ` • ${fromDate || "Start"} to ${toDate || "Today"}` : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="btn btn-neutral btn-sm rounded-none gap-2 border-0 font-semibold"
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                      Download PDF
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[520px] overflow-auto">
                      <Table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-[13%]" />
                          <col className="w-[15%]" />
                          <col className="w-[22%]" />
                          <col className="w-[13%]" />
                          <col className="w-[10%]" />
                          <col className="w-[11%]" />
                          <col className="w-[8%]" />
                          <col className="w-[8%]" />
                        </colgroup>
                        <TableHeader>
                          <TableRow className="bg-base-200 hover:bg-base-200">
                            <TableHead className="h-11 text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              USN
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Company
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Designation
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Hiring Type
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Job Type
                            </TableHead>
                            <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              CTC Range
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Final Status
                            </TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                              Offer Letter
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobOffers.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="py-16 text-center text-sm text-base-content/60"
                              >
                                No job offers found
                              </TableCell>
                            </TableRow>
                          ) : (
                            jobOffers.map((offer, index) => (
                              <TableRow
                                key={`${offer.id ?? "no-id"}-${offer.usn}-${index}`}
                                className="transition-colors hover:bg-base-200/60"
                              >
                                <TableCell className="truncate font-semibold text-base-content">
                                  {offer.usn}
                                </TableCell>
                                <TableCell className="truncate font-medium text-base-content/90">
                                  {offer.company_name ?? "—"}
                                </TableCell>
                                <TableCell className="truncate text-base-content/80">
                                  {offer.designation ?? "—"}
                                </TableCell>
                                <TableCell className="truncate text-base-content/80">
                                  {toTitleCase(offer.hiring_type)}
                                </TableCell>
                                <TableCell className="truncate text-base-content/80">
                                  {toTitleCase(offer.job_type)}
                                </TableCell>
                                <TableCell className="text-right font-bold tabular-nums text-success">
                                  {offer.ctc_min_lpa !== null ||
                                  offer.ctc_max_lpa !== null
                                    ? `${offer.ctc_min_lpa ?? "—"} – ${offer.ctc_max_lpa ?? "—"} LPA`
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge
                                    value={offer.final_interview_status}
                                  />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge
                                    value={offer.offer_letter_status}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
