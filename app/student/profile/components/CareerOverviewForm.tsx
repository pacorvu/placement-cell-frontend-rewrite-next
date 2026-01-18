"use client";

interface CareerOverviewFormProps {
  isEditing: boolean;
}

export default function CareerOverviewForm({
  isEditing,
}: CareerOverviewFormProps) {
  return (
    <div className="space-y-8">
      {/* Career Objectives Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Career Objectives</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Brief Profile Summary
          </label>
          <textarea
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
            placeholder="Write a brief summary about yourself..."
            rows={4}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Key Expertise (Comma separated)
          </label>
          <input
            type="text"
            disabled={!isEditing}
            placeholder="e.g. React, Node.js, Python"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: React, Node.js, Python
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Career Objective
          </label>
          <textarea
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
            placeholder="Describe your career goals and aspirations..."
            rows={5}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Hobbies & Interests
          </label>
          <textarea
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
            placeholder="Share your hobbies and interests..."
            rows={4}
          ></textarea>
        </div>
      </div>

      {/* Aspirations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Aspirations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Dream Company
            </label>
            <input
              type="text"
              disabled={!isEditing}
              placeholder="e.g. Google, Microsoft, Amazon"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expected / Dream Package (LPA)
            </label>
            <input
              type="number"
              disabled={!isEditing}
              placeholder="e.g. 12"
              min="0"
              step="0.1"
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
