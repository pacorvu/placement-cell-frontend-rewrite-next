"use client";

interface ParentGuardianDetailsFormProps {
  isEditing: boolean;
}

export default function ParentGuardianDetailsForm({ isEditing }: ParentGuardianDetailsFormProps) {
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
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                className="input input-bordered bg-base-100 mt-2"
                disabled
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
                  defaultValue="+91"
                  className="input input-bordered w-20 bg-base-100"
                  disabled
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input input-bordered flex-1 bg-base-100"
                  disabled
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
                className="input input-bordered bg-base-100 mt-2"
                disabled
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
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                className="input input-bordered bg-base-100 mt-2"
                disabled
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
                  defaultValue="+91"
                  className="input input-bordered w-20 bg-base-100"
                  disabled
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input input-bordered flex-1 bg-base-100"
                  disabled
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
                className="input input-bordered bg-base-100 mt-2"
                disabled
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
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Occupation</span>
              </label>
              <input
                type="text"
                placeholder="Occupation"
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                className="input input-bordered bg-base-100 mt-2"
                disabled
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
                  defaultValue="+91"
                  className="input input-bordered w-20 bg-base-100"
                  disabled
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input input-bordered flex-1 bg-base-100"
                  disabled
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Email ID</span>
              </label>
              <input
                type="email"
                placeholder="guardian@email.com"
                className="input input-bordered bg-base-100 mt-2"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
