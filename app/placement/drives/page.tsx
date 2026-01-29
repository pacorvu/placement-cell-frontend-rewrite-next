"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, Download, Plus, X } from "lucide-react";

interface Drive {
  id: number;
  company: string;
  job_profile: string;
  date: string;
  eligibility: string;
  package_ctc: string;
  status: "ACTIVE" | "CLOSED" | "UPCOMING";
}

const MOCK_DRIVES: Drive[] = [
  {
    id: 1,
    company: "1Pharmacy Network",
    job_profile: "Software Engineer",
    date: "2026-01-10",
    eligibility: "SoCSE",
    package_ctc: "8 LPA",
    status: "ACTIVE",
  },
  {
    id: 2,
    company: "Thomson Reuters",
    job_profile: "Business Analyst",
    date: "2025-12-15",
    eligibility: "SoB",
    package_ctc: "7 LPA",
    status: "ACTIVE",
  },
  {
    id: 3,
    company: "Google",
    job_profile: "Senior Developer",
    date: "2024-01-05",
    eligibility: "SoCSE",
    package_ctc: "12 LPA",
    status: "ACTIVE",
  },
  {
    id: 4,
    company: "Microsoft",
    job_profile: "SDE I",
    date: "2026-02-10",
    eligibility: "SoCSE",
    package_ctc: "15 LPA",
    status: "ACTIVE",
  },
  {
    id: 5,
    company: "Amazon",
    job_profile: "SDE I",
    date: "2023-12-10",
    eligibility: "SoCSE",
    package_ctc: "22 LPA",
    status: "ACTIVE",
  },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
  UPCOMING: "bg-blue-100 text-blue-800",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PlacementDrivesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    year: new Date().getFullYear().toString(),
    school: "",
    job_profile: "",
  });

  const companies = useMemo(() => {
    return [...new Set(MOCK_DRIVES.map((d) => d.company))];
  }, []);

  const years = useMemo(() => {
    return [...new Set(MOCK_DRIVES.map((d) => new Date(d.date).getFullYear().toString()))].sort().reverse();
  }, []);

  const schools = useMemo(() => {
    return [...new Set(MOCK_DRIVES.map((d) => d.eligibility))];
  }, []);

  const filteredDrives = useMemo(() => {
    return MOCK_DRIVES.filter((drive) => {
      const matchesSearch =
        drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.job_profile.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = selectedCompany === "all" || drive.company === selectedCompany;
      const matchesYear =
        selectedYear === "all" || new Date(drive.date).getFullYear().toString() === selectedYear;
      const matchesSchool = selectedSchool === "all" || drive.eligibility === selectedSchool;
      return matchesSearch && matchesCompany && matchesYear && matchesSchool;
    });
  }, [searchQuery, selectedCompany, selectedYear, selectedSchool]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedYear("all");
    setSelectedSchool("all");
  };

  const resetForm = () => {
    setFormData({
      company: "",
      year: new Date().getFullYear().toString(),
      school: "",
      job_profile: "",
    });
  };

  const handleViewRegistrations = (driveId: number) => {
    router.push(`/placement/drives/${driveId}/registerations`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Placement Drives</h1>
          <p className="text-base-content/60 mt-1">
            All placements table details with links to companies
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary btn-outline gap-2">
            <Download className="h-4 w-4" />
            Monthly Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-success gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Drive
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-200/50 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search drives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 bg-base-100"
            />
          </div>

          {/* Company Filter */}
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline bg-base-100 gap-2 min-w-[160px] justify-between"
            >
              {selectedCompany === "all" ? "All Companies" : selectedCompany}
              <ChevronDown className="h-4 w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-56 max-h-60 overflow-y-auto"
            >
              <li>
                <a
                  onClick={() => setSelectedCompany("all")}
                  className={selectedCompany === "all" ? "active" : ""}
                >
                  All Companies
                </a>
              </li>
              {companies.map((company) => (
                <li key={company}>
                  <a
                    onClick={() => setSelectedCompany(company)}
                    className={selectedCompany === company ? "active" : ""}
                  >
                    {company}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Year Filter */}
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline bg-base-100 gap-2 min-w-[140px] justify-between"
            >
              {selectedYear === "all" ? "All Years" : selectedYear}
              <ChevronDown className="h-4 w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-40"
            >
              <li>
                <a
                  onClick={() => setSelectedYear("all")}
                  className={selectedYear === "all" ? "active" : ""}
                >
                  All Years
                </a>
              </li>
              {years.map((year) => (
                <li key={year}>
                  <a
                    onClick={() => setSelectedYear(year)}
                    className={selectedYear === year ? "active" : ""}
                  >
                    {year}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* School Filter */}
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline bg-base-100 gap-2 min-w-[140px] justify-between"
            >
              {selectedSchool === "all" ? "All Schools" : selectedSchool}
              <ChevronDown className="h-4 w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-40"
            >
              <li>
                <a
                  onClick={() => setSelectedSchool("all")}
                  className={selectedSchool === "all" ? "active" : ""}
                >
                  All Schools
                </a>
              </li>
              {schools.map((school) => (
                <li key={school}>
                  <a
                    onClick={() => setSelectedSchool(school)}
                    className={selectedSchool === school ? "active" : ""}
                  >
                    {school}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Filters */}
          <button onClick={clearFilters} className="btn btn-ghost text-error">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-base-200">
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Company
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Registrations
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Job Profile
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Eligibility
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Package (CTC)
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrives.map((drive) => (
                <TableRow
                  key={drive.id}
                  className="border-b border-base-200 hover:bg-base-50"
                >
                  <TableCell className="font-medium text-base-content">
                    {drive.company}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewRegistrations(drive.id)}
                      className="btn btn-sm btn-primary"
                    >
                      View Registrations
                    </button>
                  </TableCell>
                  <TableCell className="text-base-content/80">
                    {drive.job_profile}
                  </TableCell>
                  <TableCell className="text-base-content/70">
                    {formatDate(drive.date)}
                  </TableCell>
                  <TableCell className="text-base-content/70">
                    {drive.eligibility}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {drive.package_ctc}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded ${STATUS_STYLES[drive.status]}`}
                    >
                      {drive.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrives.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-base-content/60">
                    No drives found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Drive Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-xl mb-6">Add New Placement Drive</h3>

            <div className="space-y-4">
              {/* Company Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Company Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="e.g. Google"
                />
              </div>

              {/* Year and School/Department - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Year</span>
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="input input-bordered"
                    placeholder="2024"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      School/Department <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) =>
                      setFormData({ ...formData, school: e.target.value })
                    }
                    className="input input-bordered"
                    placeholder="CSE"
                  />
                </div>
              </div>

              {/* Job Profile */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Profile</span>
                </label>
                <input
                  type="text"
                  value={formData.job_profile}
                  onChange={(e) =>
                    setFormData({ ...formData, job_profile: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button className="btn btn-primary">Save Drive</button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />
        </div>
      )}
    </div>
  );
}
