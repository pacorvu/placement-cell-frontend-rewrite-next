"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    // Animate profile completion from 0 to 75
    let current = 0;
    const target = 75;
    const increment = 1;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setProfileCompletion(current);
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // Get color based on completion percentage
  const getCompletionColor = (percentage: number) => {
    if (percentage < 30) return "text-error";
    if (percentage < 50) return "text-warning";
    if (percentage < 75) return "text-info";
    return "text-success";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "progress-error";
    if (percentage < 50) return "progress-warning";
    if (percentage < 75) return "progress-info";
    return "progress-success";
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="alert alert-warning mb-6">
            <i className="material-icons shrink-0 w-6 h-6">warning</i>
            <div className="flex-1">
              <h3 className="font-bold">Complete Your Profile</h3>
              <div className="text-sm">
                Your profile is {profileCompletion}% complete. Please update
                your details to apply for jobs.
              </div>
            </div>
            <Link
              href="/student/profile"
              className="btn btn-sm btn-neutral btn-outline"
            >
              Complete Now
            </Link>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Welcome back, Student!
          </h1>
          <p className="text-base-content/60 mt-1">
            Here&apos;s what&apos;s happening with your job applications.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div className="stat-figure text-primary">
                <i className="material-icons inline-block w-8 h-8">description</i>
              </div>
              <div className="stat-title">Total Applications</div>
              <div className="stat-value text-primary">0</div>
              <div className="stat-desc">Start applying</div>
            </div>
          </div>

          {/* Interviews Scheduled */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <i className="material-icons inline-block w-8 h-8">event</i>
              </div>
              <div className="stat-title">Interviews Scheduled</div>
              <div className="stat-value text-secondary">0</div>
              <div className="stat-desc">No interviews</div>
            </div>
          </div>

          {/* Offers Received */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div className="stat-figure text-success">
                <i className="material-icons inline-block w-8 h-8">check_circle</i>
              </div>
              <div className="stat-title">Offers Received</div>
              <div className="stat-value text-success">0</div>
              <div className="stat-desc">No offers yet</div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div
                className={`stat-figure ${getCompletionColor(profileCompletion)}`}
              >
                <i className="material-icons inline-block w-8 h-8">person</i>
              </div>
              <div className="stat-title">Profile Completeness</div>
              <div
                className={`stat-value ${getCompletionColor(profileCompletion)}`}
              >
                {profileCompletion}%
              </div>
              <div className="stat-desc">
                <progress
                  className={`progress ${getProgressColor(profileCompletion)} w-full mt-1`}
                  value={profileCompletion}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 border border-base-300 shadow">
              <div className="card-body">
                <h2 className="card-title">Recent Applications</h2>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-base-content/60"
                        >
                          No applications yet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link
                    href="/student/applications"
                    className="btn btn-primary btn-sm"
                  >
                    View All Applications
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <div className="card bg-base-100 border border-base-300 shadow">
              <div className="card-body">
                <h2 className="card-title text-lg">Upcoming Interviews</h2>
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <i className="material-icons shrink-0 w-6 h-6">info</i>
                    <span className="text-sm">No interviews scheduled yet</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 border border-base-300 shadow">
              <div className="card-body">
                <h2 className="card-title text-lg">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href="/student/profile"
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <i className="material-icons inline-block w-4 h-4 mr-2">person</i>
                    Edit Profile
                  </Link>
                  <Link
                    href="/student/resume"
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <i className="material-icons inline-block w-4 h-4 mr-2">description</i>
                    Upload Resume
                  </Link>
                  <Link
                    href="/student/drives"
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <i className="material-icons inline-block w-4 h-4 mr-2">work</i>
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
