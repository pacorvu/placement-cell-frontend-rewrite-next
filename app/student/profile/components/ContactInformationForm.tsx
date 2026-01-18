"use client";

interface ContactInformationFormProps {
  isEditing: boolean;
}

export default function ContactInformationForm({
  isEditing,
}: ContactInformationFormProps) {
  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              College Email
            </label>
            <input
              type="email"
              placeholder="student@university.edu"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Email
            </label>
            <input
              type="email"
              placeholder="personal@email.com"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Country Code
            </label>
            <input
              type="text"
              placeholder="+91"
              defaultValue="+91"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Social & Portfolio Links Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social & Portfolio Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub</label>
            <input
              type="url"
              placeholder="https://github.com/username"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Portfolio Website
            </label>
            <input
              type="url"
              placeholder="https://yourportfolio.com"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Other Link</label>
            <input
              type="url"
              placeholder="https://other-link.com"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        type="button"
        className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Edit
      </button>
    </div>
  );
}
