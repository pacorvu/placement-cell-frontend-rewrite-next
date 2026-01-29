"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  initials: string;
  color: string;
}

const MOCK_COMPANIES: Company[] = [
  { id: 1, name: "1Pharmacy Network", initials: "1P", color: "text-green-600" },
  { id: 2, name: "Thomson Reuters", initials: "TH", color: "text-green-600" },
  { id: 3, name: "Google", initials: "GO", color: "text-blue-600" },
  { id: 4, name: "Microsoft", initials: "MI", color: "text-gray-600" },
  { id: 5, name: "Amazon", initials: "AM", color: "text-orange-600" },
  { id: 6, name: "Flipkart", initials: "FL", color: "text-yellow-600" },
  { id: 7, name: "Adobe", initials: "AD", color: "text-red-600" },
  { id: 8, name: "Goldman Sachs", initials: "GO", color: "text-blue-600" },
  { id: 9, name: "J.P. Morgan", initials: "J.", color: "text-gray-600" },
  { id: 10, name: "Morgan Stanley", initials: "MO", color: "text-gray-600" },
  { id: 11, name: "Deloitte", initials: "DE", color: "text-green-600" },
  { id: 12, name: "KPMG", initials: "KP", color: "text-blue-600" },
  { id: 13, name: "PwC", initials: "PW", color: "text-orange-600" },
  { id: 14, name: "EY", initials: "EY", color: "text-yellow-600" },
  { id: 15, name: "Accenture", initials: "AC", color: "text-purple-600" },
  { id: 16, name: "Infosys", initials: "IN", color: "text-blue-600" },
  { id: 17, name: "TCS", initials: "TC", color: "text-red-600" },
  { id: 18, name: "Wipro", initials: "WI", color: "text-green-600" },
  { id: 19, name: "Capgemini", initials: "CA", color: "text-blue-600" },
  { id: 20, name: "Cognizant", initials: "CO", color: "text-blue-600" },
  { id: 21, name: "IBM", initials: "IB", color: "text-blue-600" },
  { id: 22, name: "Oracle", initials: "OR", color: "text-red-600" },
  { id: 23, name: "Salesforce", initials: "SA", color: "text-blue-400" },
  { id: 24, name: "SAP", initials: "SA", color: "text-blue-600" },
  { id: 25, name: "Cisco", initials: "CI", color: "text-blue-600" },
  { id: 26, name: "Intel", initials: "IN", color: "text-blue-600" },
  { id: 27, name: "Samsung", initials: "SA", color: "text-blue-600" },
  { id: 28, name: "Uber", initials: "UB", color: "text-gray-800" },
  { id: 29, name: "Ola", initials: "OL", color: "text-green-600" },
  { id: 30, name: "Swiggy", initials: "SW", color: "text-orange-600" },
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

export default function CompaniesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [remarks, setRemarks] = useState<string[]>([""]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_type: "",
    hr_email: "",
    contact_number: "",
    role: "",
    address: "",
    website: "",
    linkedin: "",
    logo: null as File | null,
  });

  const filteredCompanies = useMemo(() => {
    return MOCK_COMPANIES.filter((company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      company_type: "",
      hr_email: "",
      contact_number: "",
      role: "",
      address: "",
      website: "",
      linkedin: "",
      logo: null,
    });
    setRemarks([""]);
  };

  const addRemark = () => {
    setRemarks([...remarks, ""]);
  };

  const updateRemark = (index: number, value: string) => {
    const newRemarks = [...remarks];
    newRemarks[index] = value;
    setRemarks(newRemarks);
  };

  const handleCompanyClick = (companyId: number) => {
    router.push(`/placement/companies/${companyId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Companies</h1>
          <p className="text-base-content/60 mt-1">
            Browse hiring partners; click for full details
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-success gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
          <button onClick={() => router.back()} className="btn btn-outline">
            Back
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
        <input
          type="text"
          placeholder="Search companies"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-12 py-6"
        />
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

      {/* Companies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredCompanies.map((company) => (
          <button
            key={company.id}
            onClick={() => handleCompanyClick(company.id)}
            className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-base-200/70 transition-all duration-200 group"
          >
            <div className="w-14 h-14 rounded-full bg-base-200 group-hover:bg-base-300 flex items-center justify-center transition-colors shadow-sm">
              <span className={`text-lg font-bold ${company.color}`}>
                {company.initials}
              </span>
            </div>
            <span className="text-sm text-center font-medium text-base-content/80 leading-tight">
              {company.name}
            </span>
          </button>
        ))}
        {filteredCompanies.length === 0 && (
          <div className="col-span-full text-center py-10 text-base-content/60">
            No companies found
          </div>
        )}
      </div>

      {/* Add Company Modal */}
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

            <h3 className="font-bold text-xl mb-6">Add Company</h3>

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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered"
                  rows={3}
                />
              </div>

              {/* Company Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company Type</span>
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) =>
                    setFormData({ ...formData, company_type: e.target.value })
                  }
                  className="select select-bordered"
                >
                  <option value="">Select Company Type</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Startup">Startup</option>
                  <option value="MNC">MNC</option>
                </select>
              </div>

              {/* HR Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">HR Email</span>
                </label>
                <input
                  type="email"
                  value={formData.hr_email}
                  onChange={(e) => setFormData({ ...formData, hr_email: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Contact Number & Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Contact Number</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Role / Designation</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="textarea textarea-bordered"
                  rows={2}
                />
              </div>

              {/* Website */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Website</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* LinkedIn */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">LinkedIn</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              {/* Logo */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Logo</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.files?.[0] || null })
                  }
                  className="file-input file-input-bordered"
                />
              </div>

              {/* Remarks */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Remarks</span>
                </label>
                {remarks.map((remark, index) => (
                  <input
                    key={index}
                    type="text"
                    value={remark}
                    onChange={(e) => updateRemark(index, e.target.value)}
                    className="input input-bordered mb-2"
                    placeholder={`Remark ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={addRemark}
                  className="btn btn-sm btn-ghost gap-1 self-start"
                >
                  <Plus className="h-4 w-4" />
                  Add Remark
                </button>
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
