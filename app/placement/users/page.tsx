"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Types based on API schema
type OtherStakeholderRoleType = "COMPANY_REP" | "DEAN" | "MANAGEMENT" | "ADMISSION_OFFICE";

interface OtherStakeholder {
  user_id: number;
  email: string;
  role_name: string;
}

interface OtherStakeholderCreate {
  email: string;
  role_type: OtherStakeholderRoleType;
}

interface OtherStakeholderUpdate {
  email?: string | null;
  role_type?: OtherStakeholderRoleType | null;
}

// Validation schemas
const createStakeholderSchema = z.object({
  email: z.string().email("Invalid email address"),
  role_type: z.enum(["COMPANY_REP", "DEAN", "MANAGEMENT", "ADMISSION_OFFICE"], {
    error: "Please select a role",
  }),
});

const updateStakeholderSchema = z.object({
  email: z.string().email("Invalid email address").optional().nullable(),
  role_type: z.enum(["COMPANY_REP", "DEAN", "MANAGEMENT", "ADMISSION_OFFICE"]).optional().nullable(),
});

// API functions
const stakeholderApi = {
  getAll: async (): Promise<OtherStakeholder[]> => {
    const { data } = await api.get("/other-stakeholders/");
    return data;
  },
  create: async (stakeholder: OtherStakeholderCreate): Promise<OtherStakeholder> => {
    const { data } = await api.post("/other-stakeholders/", stakeholder);
    return data;
  },
  update: async (userId: number, stakeholder: OtherStakeholderUpdate): Promise<OtherStakeholder> => {
    const { data } = await api.patch(`/other-stakeholders/${userId}`, stakeholder);
    return data;
  },
  delete: async (userId: number): Promise<void> => {
    await api.delete(`/other-stakeholders/${userId}`);
  },
};

const ROLE_OPTIONS: { value: OtherStakeholderRoleType; label: string }[] = [
  { value: "COMPANY_REP", label: "Company Representative" },
  { value: "DEAN", label: "Dean" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "ADMISSION_OFFICE", label: "Admission Office" },
];

const ROLE_BADGE_STYLES: Record<string, string> = {
  COMPANY_REP: "bg-blue-100 text-blue-800 border-blue-300",
  DEAN: "bg-purple-100 text-purple-800 border-purple-300",
  MANAGEMENT: "bg-amber-100 text-amber-800 border-amber-300",
  ADMISSION_OFFICE: "bg-green-100 text-green-800 border-green-300",
};

function getRoleBadgeStyle(role: string): string {
  return ROLE_BADGE_STYLES[role.toUpperCase()] || "bg-gray-100 text-gray-800 border-gray-300";
}

export default function UserManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<OtherStakeholder | null>(null);
  const queryClient = useQueryClient();

  // Fetch all stakeholders
  const {
    data: stakeholders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["other-stakeholders"],
    queryFn: stakeholderApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: stakeholderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["other-stakeholders"] });
      setShowAddModal(false);
      toast.success("Stakeholder created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create stakeholder");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: OtherStakeholderUpdate }) =>
      stakeholderApi.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["other-stakeholders"] });
      setEditingUser(null);
      toast.success("Stakeholder updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update stakeholder");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: stakeholderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["other-stakeholders"] });
      toast.success("Stakeholder deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete stakeholder");
    },
  });

  // Create form
  const createForm = useForm({
    defaultValues: {
      email: "",
      role_type: "COMPANY_REP" as OtherStakeholderRoleType,
    },
    validators: {
      onBlur: createStakeholderSchema,
    },
    onSubmit: async ({ value }) => {
      createMutation.mutate(value);
    },
  });

  // Edit form
  const editForm = useForm({
    defaultValues: {
      email: editingUser?.email || "",
      role_type: (editingUser?.role_name as OtherStakeholderRoleType) || "COMPANY_REP",
    },
    validators: {
      onBlur: createStakeholderSchema,
    },
    onSubmit: async ({ value }) => {
      if (editingUser) {
        updateMutation.mutate({
          userId: editingUser.user_id,
          data: value,
        });
      }
    },
  });

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this stakeholder?")) {
      deleteMutation.mutate(userId);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    createForm.reset();
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    editForm.reset();
  };

  const handleOpenEditModal = (user: OtherStakeholder) => {
    setEditingUser(user);
    editForm.setFieldValue("email", user.email);
    editForm.setFieldValue("role_type", user.role_name as OtherStakeholderRoleType);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-primary">Other Stakeholders Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Stakeholder
        </button>
      </div>

      {/* Table Card */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-error m-4">
              <span>Error loading stakeholders: {(error as Error).message}</span>
            </div>
          ) : stakeholders.length === 0 ? (
            <div className="text-center p-12 text-base-content/60">
              No stakeholders found. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-base-200">
                  <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-base-content/70 uppercase text-xs tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((user, index) => (
                  <TableRow
                    key={user.user_id}
                    className="border-b border-base-200 hover:bg-base-50"
                  >
                    <TableCell className="text-base-content/60">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded border ${getRoleBadgeStyle(user.role_name)}`}
                      >
                        {user.role_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="btn btn-sm btn-square btn-primary"
                          disabled={updateMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="btn btn-sm btn-square btn-error"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={handleCloseAddModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Add New Stakeholder</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                createForm.handleSubmit();
              }}
            >
              <div className="space-y-4">
                <createForm.Field
                  name="email"
                  children={(field) => (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="input input-bordered"
                        placeholder="Enter email"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.state.meta.errors[0]?.message}
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                />

                <createForm.Field
                  name="role_type"
                  children={(field) => (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Role</span>
                      </label>
                      <select
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value as OtherStakeholderRoleType)}
                        onBlur={field.handleBlur}
                        className="select select-bordered"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {field.state.meta.errors.length > 0 && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.state.meta.errors[0]?.message}
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="btn btn-ghost"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Stakeholder"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCloseAddModal} />
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={handleCloseEditModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Edit Stakeholder</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editForm.handleSubmit();
              }}
            >
              <div className="space-y-4">
                <editForm.Field
                  name="email"
                  children={(field) => (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="input input-bordered"
                        placeholder="Enter email"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.state.meta.errors[0]?.message}
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                />

                <editForm.Field
                  name="role_type"
                  children={(field) => (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Role</span>
                      </label>
                      <select
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value as OtherStakeholderRoleType)}
                        onBlur={field.handleBlur}
                        className="select select-bordered"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {field.state.meta.errors.length > 0 && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {field.state.meta.errors[0]?.message}
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-ghost"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCloseEditModal} />
        </div>
      )}
    </div>
  );
}
