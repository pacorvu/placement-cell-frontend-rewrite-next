"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, X } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  stakeholder: string;
  created_at: string;
}

type RoleFilter = "all" | "Placement Team" | "Students" | "Alumni" | "Company Reps";

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Placement Team", label: "Placement Team" },
  { key: "Students", label: "Students" },
  { key: "Alumni", label: "Alumni" },
  { key: "Company Reps", label: "Company Reps" },
];

const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Placement Officer",
    email: "admin@rvu.edu.in",
    role: "ADMIN",
    stakeholder: "Placement Team",
    created_at: "2023-01-01",
  },
  {
    id: 2,
    name: "Super Admin",
    email: "superadmin@rvu.edu.in",
    role: "SUPERADMIN",
    stakeholder: "Placement Team",
    created_at: "2023-01-01",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john@student.rvu.edu.in",
    role: "STUDENT",
    stakeholder: "Students",
    created_at: "2023-06-15",
  },
  {
    id: 4,
    name: "Jane Smith",
    email: "jane@student.rvu.edu.in",
    role: "STUDENT",
    stakeholder: "Students",
    created_at: "2023-06-16",
  },
  {
    id: 5,
    name: "Alice Alumni",
    email: "alice@alumni.rvu.edu.in",
    role: "ALUMNI",
    stakeholder: "Alumni",
    created_at: "2022-05-20",
  },
  {
    id: 6,
    name: "Bob Recruiter",
    email: "bob@techcorp.com",
    role: "COMPANY_REP",
    stakeholder: "Company Reps",
    created_at: "2023-08-10",
  },
];

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: "bg-amber-100 text-amber-800 border-amber-300",
  SUPERADMIN: "bg-yellow-100 text-yellow-800 border-yellow-300",
  STUDENT: "bg-green-100 text-green-800 border-green-300",
  ALUMNI: "bg-purple-100 text-purple-800 border-purple-300",
  COMPANY_REP: "bg-blue-100 text-blue-800 border-blue-300",
};

function getRoleBadgeStyle(role: string): string {
  return ROLE_BADGE_STYLES[role.toUpperCase()] || "bg-gray-100 text-gray-800 border-gray-300";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UserManagementPage() {
  const [activeFilter, setActiveFilter] = useState<RoleFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    stakeholder: "Students",
    password: "",
  });

  const filteredUsers = useMemo(() => {
    if (activeFilter === "all") return MOCK_USERS;
    return MOCK_USERS.filter((user) => user.stakeholder === activeFilter);
  }, [activeFilter]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "STUDENT",
      stakeholder: "Students",
      password: "",
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      stakeholder: user.stakeholder,
      password: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-primary">User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {ROLE_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? "bg-primary text-primary-content"
                : "bg-base-200 text-base-content hover:bg-base-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-base-200">
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Stakeholder
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Created At
                </TableHead>
                <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="border-b border-base-200 hover:bg-base-50"
                >
                  <TableCell className="text-base-content/60">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-base-content/70">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded border ${getRoleBadgeStyle(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-base-content/70">
                    {user.stakeholder}
                  </TableCell>
                  <TableCell className="text-base-content/70">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn btn-sm btn-square btn-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Add New User</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter name"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter email"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter password"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="select select-bordered"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="STUDENT">Student</option>
                  <option value="ALUMNI">Alumni</option>
                  <option value="COMPANY_REP">Company Rep</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stakeholder</span>
                </label>
                <select
                  value={formData.stakeholder}
                  onChange={(e) =>
                    setFormData({ ...formData, stakeholder: e.target.value })
                  }
                  className="select select-bordered"
                >
                  <option value="Placement Team">Placement Team</option>
                  <option value="Students">Students</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Company Reps">Company Reps</option>
                </select>
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
              <button className="btn btn-primary">Add User</button>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => {
                setEditingUser(null);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Edit User</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter name"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter email"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password (leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input input-bordered"
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="select select-bordered"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="STUDENT">Student</option>
                  <option value="ALUMNI">Alumni</option>
                  <option value="COMPANY_REP">Company Rep</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stakeholder</span>
                </label>
                <select
                  value={formData.stakeholder}
                  onChange={(e) =>
                    setFormData({ ...formData, stakeholder: e.target.value })
                  }
                  className="select select-bordered"
                >
                  <option value="Placement Team">Placement Team</option>
                  <option value="Students">Students</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Company Reps">Company Reps</option>
                </select>
              </div>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setEditingUser(null);
                  resetForm();
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setEditingUser(null);
              resetForm();
            }}
          />
        </div>
      )}
    </div>
  );
}
