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

interface JobOffer {
  id: number;
  usn: string;
  student: string;
  company: string;
  designation: string;
  job_type: string;
  ctc_lpa: string;
  offer_status: "Accepted" | "Pending" | "Rejected";
  school: string;
}

const MOCK_OFFERS: JobOffer[] = [
  {
    id: 1,
    usn: "1RUB24MBA0006",
    student: "AMBICA M KALCOOR",
    company: "Thomson Reuters",
    designation: "BA role",
    job_type: "Full-time",
    ctc_lpa: "-",
    offer_status: "Accepted",
    school: "SoB",
  },
  {
    id: 2,
    usn: "1RVU22CSE001",
    student: "A Shree Vyshnavi",
    company: "1Pharmacy Network",
    designation: "Software Intern",
    job_type: "Internship + FTE",
    ctc_lpa: "-",
    offer_status: "Accepted",
    school: "SoCSE - BTech",
  },
  {
    id: 3,
    usn: "1RVU22CSE001",
    student: "A Shree Vyshnavi",
    company: "Microsoft",
    designation: "SDE I",
    job_type: "Full-time",
    ctc_lpa: "-",
    offer_status: "Pending",
    school: "SoCSE - BTech",
  },
  {
    id: 4,
    usn: "1RVU22CSE001",
    student: "A Shree Vyshnavi",
    company: "Google",
    designation: "Software Engineer",
    job_type: "Full-time",
    ctc_lpa: "-",
    offer_status: "Rejected",
    school: "SoCSE - BTech",
  },
  {
    id: 5,
    usn: "1RVU22CSE001",
    student: "A Shree Vyshnavi",
    company: "Amazon",
    designation: "SDE Intern",
    job_type: "Internship",
    ctc_lpa: "-",
    offer_status: "Pending",
    school: "SoCSE - BTech",
  },
];

const SCHOOL_COUNTS = [
  { name: "SoB", count: 222 },
  { name: "SoCSE - BTech", count: 198 },
  { name: "SoB - PG", count: 167 },
  { name: "SoD - UG", count: 113 },
  { name: "SoCSE - BSc", count: 106 },
  { name: "SoB (Hons)", count: 62 },
  { name: "SoLAS", count: 37 },
  { name: "SoD - PG", count: 33 },
  { name: "SoE", count: 22 },
  { name: "SoFMA", count: 6 },
];

const STATUS_STYLES: Record<string, string> = {
  Accepted: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function JobOffersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    student: "",
    company: "",
    designation: "",
    job_type: "",
    internship_duration: "",
    internship_stipend: "",
    ctc_min: "",
    ctc_max: "",
    ctc_variable: "",
    offer_status: "",
    interview_status: "",
    remarks: "",
  });

  const companies = useMemo(() => {
    return [...new Set(MOCK_OFFERS.map((o) => o.company))];
  }, []);

  const jobTypes = useMemo(() => {
    return [...new Set(MOCK_OFFERS.map((o) => o.job_type))];
  }, []);

  const filteredOffers = useMemo(() => {
    return MOCK_OFFERS.filter((offer) => {
      const matchesSearch =
        offer.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = selectedCompany === "all" || offer.company === selectedCompany;
      const matchesJobType = selectedJobType === "all" || offer.job_type === selectedJobType;
      const matchesSchool = !selectedSchool || offer.school === selectedSchool;
      return matchesSearch && matchesCompany && matchesJobType && matchesSchool;
    });
  }, [searchQuery, selectedCompany, selectedJobType, selectedSchool]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedJobType("all");
    setSelectedSchool(null);
  };

  const resetForm = () => {
    setFormData({
      student: "",
      company: "",
      designation: "",
      job_type: "",
      internship_duration: "",
      internship_stipend: "",
      ctc_min: "",
      ctc_max: "",
      ctc_variable: "",
      offer_status: "",
      interview_status: "",
      remarks: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Offers</h1>
          <p className="text-base-content/60 mt-1">
            All job offers across students and companies
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-success gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Offer
          </button>
          <button className="btn btn-primary btn-outline gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            onClick={() => router.push("/placement/companies")}
            className="btn btn-outline"
          >
            Add New Company
          </button>
          <button onClick={() => router.back()} className="btn btn-ghost">
            Back
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by student, company, role, type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-12 py-6"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Company Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[160px] justify-between"
          >
            {selectedCompany === "all" ? "Filter by Company" : selectedCompany}
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

        {/* Job Type Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[160px] justify-between"
          >
            {selectedJobType === "all" ? "Filter by Job Type" : selectedJobType}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48"
          >
            <li>
              <a
                onClick={() => setSelectedJobType("all")}
                className={selectedJobType === "all" ? "active" : ""}
              >
                All Types
              </a>
            </li>
            {jobTypes.map((type) => (
              <li key={type}>
                <a
                  onClick={() => setSelectedJobType(type)}
                  className={selectedJobType === type ? "active" : ""}
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={clearFilters} className="btn btn-ghost text-base-content/60">
          Clear Filters
        </button>
      </div>

      {/* School Filter Pills */}
      <div>
        <h3 className="font-semibold mb-3">Filter by School</h3>
        <div className="flex flex-wrap gap-3">
          {SCHOOL_COUNTS.map((school) => (
            <button
              key={school.name}
              onClick={() =>
                setSelectedSchool(selectedSchool === school.name ? null : school.name)
              }
              className={`flex flex-col items-center px-4 py-2 rounded-lg border transition-colors min-w-[80px] ${
                selectedSchool === school.name
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              }`}
            >
              <span className="text-xs text-base-content/70">{school.name}</span>
              <span className="text-lg font-bold text-primary">{school.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800 text-white">
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  USN
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  Student
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  Company
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  Designation
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  Job Type
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  CTC (LPA) *
                </TableHead>
                <TableHead className="font-semibold uppercase text-xs tracking-wider text-white">
                  Offer Letter Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow
                  key={offer.id}
                  className="border-b border-base-200 hover:bg-base-50"
                >
                  <TableCell className="font-mono text-primary font-medium">
                    {offer.usn}
                  </TableCell>
                  <TableCell className="font-medium">{offer.student}</TableCell>
                  <TableCell className="text-primary">{offer.company}</TableCell>
                  <TableCell className="text-base-content/80">
                    {offer.designation}
                  </TableCell>
                  <TableCell className="text-base-content/70">
                    {offer.job_type}
                  </TableCell>
                  <TableCell className="text-base-content/70">{offer.ctc_lpa}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded ${STATUS_STYLES[offer.offer_status]}`}
                    >
                      {offer.offer_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOffers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-base-content/60">
                    No offers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-xl mb-6">Add Job Offer</h3>

            <div className="space-y-4">
              {/* Students */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Students <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="input input-bordered"
                  placeholder="Type name, USN, school or program"
                />
              </div>

              {/* Company */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Company <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input input-bordered"
                  placeholder="Search or type company"
                />
              </div>

              {/* Designation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Designation</span>
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Job Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Type</span>
                </label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  className="select select-bordered"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Internship + FTE">Internship + FTE</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Internship Duration & Stipend */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internship Duration</span>
                  </label>
                  <input
                    type="text"
                    value={formData.internship_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, internship_duration: e.target.value })
                    }
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internship Stipend</span>
                  </label>
                  <input
                    type="text"
                    value={formData.internship_stipend}
                    onChange={(e) =>
                      setFormData({ ...formData, internship_stipend: e.target.value })
                    }
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* CTC Min & Max */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CTC Min (LPA)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ctc_min}
                    onChange={(e) => setFormData({ ...formData, ctc_min: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CTC Max (LPA)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ctc_max}
                    onChange={(e) => setFormData({ ...formData, ctc_max: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* CTC Variable Pay */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">CTC Variable Pay</span>
                </label>
                <input
                  type="text"
                  value={formData.ctc_variable}
                  onChange={(e) => setFormData({ ...formData, ctc_variable: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Offer Letter Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Offer Letter Status</span>
                </label>
                <input
                  type="text"
                  value={formData.offer_status}
                  onChange={(e) => setFormData({ ...formData, offer_status: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Final Interview Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Final Interview Status</span>
                </label>
                <input
                  type="text"
                  value={formData.interview_status}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_status: e.target.value })
                  }
                  className="input input-bordered"
                />
              </div>

              {/* Remarks */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Remarks</span>
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="textarea textarea-bordered"
                  rows={3}
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
              <button className="btn btn-success">Save</button>
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
