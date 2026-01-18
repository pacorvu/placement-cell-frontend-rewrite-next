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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-warning"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h2 className="text-lg font-bold text-base-content">
              Father's Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Type</span>
              </label>
              <select
                className="select select-bordered bg-base-100 mt-2"
                defaultValue="father"
              >
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Name</span>
              </label>
              <input
                type="text"
                placeholder="Father's Name"
                className="input input-bordered bg-base-100 mt-2"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                className="input input-bordered bg-base-100 mt-2"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Mobile Number</span>
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  defaultValue="+91"
                  className="input input-bordered w-20 bg-base-100"
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input input-bordered flex-1 bg-base-100"
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mother's Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-warning"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h2 className="text-lg font-bold text-base-content">
              Mother's Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Type</span>
              </label>
              <select
                className="select select-bordered bg-base-100 mt-2"
                defaultValue="mother"
              >
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Name</span>
              </label>
              <input
                type="text"
                placeholder="Mother's Name"
                className="input input-bordered bg-base-100 mt-2"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Organisation</span>
              </label>
              <input
                type="text"
                placeholder="Organisation Name"
                className="input input-bordered bg-base-100 mt-2"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Mobile Number</span>
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  defaultValue="+91"
                  className="input input-bordered w-20 bg-base-100"
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input input-bordered flex-1 bg-base-100"
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
              />
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-end mt-6">
            <button className="btn btn-warning text-white">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
