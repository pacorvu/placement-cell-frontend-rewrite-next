"use client";

import { useUser } from "@/lib/useUser";


interface ParentGuardianDetailsFormProps {
  isEditing: boolean;
}

export default function ParentGuardianDetailsForm({
  isEditing
}: ParentGuardianDetailsFormProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Extract parent details by type
  const fatherDetails = user?.parent_details?.find(
    (parent) => parent.parent_type === "Father"
  );
  const motherDetails = user?.parent_details?.find(
    (parent) => parent.parent_type === "Mother"
  );
  const guardianDetails = user?.parent_details?.find(
    (parent) => parent.parent_type === "Guardian"
  );

  return (
    <div className="space-y-6">
      {/* Father's Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons h-5 w-5 text-warning">person</i>
            <h2 className="text-lg font-bold text-base-content">
              Father's Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Name</span>
              </label>
              <input
                type="text"
                placeholder="Father's Name"
                value={fatherDetails?.name || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                value={fatherDetails?.occupation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={fatherDetails?.organisation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Mobile Number</span>
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={fatherDetails?.phone_country_code || "+91"}
                  className="input input-bordered w-20 bg-base-100"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={fatherDetails?.phone_number || ""}
                  className="input input-bordered flex-1 bg-base-100"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Email ID</span>
              </label>
              <input
                type="email"
                placeholder="father@email.com"
                value={fatherDetails?.email || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mother's Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons h-5 w-5 text-warning">person</i>
            <h2 className="text-lg font-bold text-base-content">
              Mother's Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Name</span>
              </label>
              <input
                type="text"
                placeholder="Mother's Name"
                value={motherDetails?.name || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                value={motherDetails?.occupation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={motherDetails?.organisation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Mobile Number</span>
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={motherDetails?.phone_country_code || "+91"}
                  className="input input-bordered w-20 bg-base-100"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={motherDetails?.phone_number || ""}
                  className="input input-bordered flex-1 bg-base-100"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Email ID</span>
              </label>
              <input
                type="email"
                placeholder="mother@email.com"
                value={motherDetails?.email || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guardian Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons h-5 w-5 text-warning">family_restroom</i>
            <h2 className="text-lg font-bold text-base-content">
              Guardian Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Name</span>
              </label>
              <input
                type="text"
                placeholder="Guardian's Name"
                value={guardianDetails?.name || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                value={guardianDetails?.occupation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={guardianDetails?.organisation || ""}
                className="input input-bordered bg-base-100 mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Mobile Number</span>
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={guardianDetails?.phone_country_code || "+91"}
                  className="input input-bordered w-20 bg-base-100"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={guardianDetails?.phone_number || ""}
                  className="input input-bordered flex-1 bg-base-100"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-base-content/70">Email ID</span>
                </label>
                <input
                  type="email"
                  placeholder="guardian@email.com"
                  value={guardianDetails?.email || ""}
                  className="input input-bordered bg-base-100 mt-2"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
