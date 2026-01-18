'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleLogout = () => {
    router.push('/login');
  };

  // Get color based on completion percentage
  const getCompletionColor = (percentage: number) => {
    if (percentage < 30) return 'text-error';
    if (percentage < 50) return 'text-warning';
    if (percentage < 75) return 'text-info';
    return 'text-success';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'progress-error';
    if (percentage < 50) return 'progress-warning';
    if (percentage < 75) return 'progress-info';
    return 'progress-success';
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-300">
        <div className="navbar max-w-7xl mx-auto px-4">
          <div className="navbar-start">
            <Link href="/" className="text-xl font-bold">
              Placement Cell
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li><Link href="/student/dashboard" className="active">Dashboard</Link></li>
              <li><Link href="/student/profile">Profile</Link></li>
              <li><Link href="/student/drives">Placement Drives</Link></li>
              <li><Link href="/student/offers">Job Offers</Link></li>
              <li><Link href="/student/events">Events</Link></li>
              <li><Link href="/policy">Policy</Link></li>
            </ul>
          </div>
          <div className="navbar-end gap-2">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <button onClick={handleLogout} className="btn btn-primary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="flex-1">
              <h3 className="font-bold">Complete Your Profile</h3>
              <div className="text-sm">Your profile is {profileCompletion}% complete. Please update your details to apply for jobs.</div>
            </div>
            <Link href="/student/profile" className="btn btn-sm btn-primary">
              Complete Now
            </Link>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Welcome back, Student!</h1>
          <p className="text-base-content/60 mt-1">Here&apos;s what&apos;s happening with your job applications.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Applications */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="stat-title">Offers Received</div>
              <div className="stat-value text-success">0</div>
              <div className="stat-desc">No offers yet</div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="stats shadow border border-base-300">
            <div className="stat">
              <div className={`stat-figure ${getCompletionColor(profileCompletion)}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div className="stat-title">Profile Completeness</div>
              <div className={`stat-value ${getCompletionColor(profileCompletion)}`}>{profileCompletion}%</div>
              <div className="stat-desc">
                <progress className={`progress ${getProgressColor(profileCompletion)} w-full mt-1`} value={profileCompletion} max="100"></progress>
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
                        <td colSpan={4} className="text-center py-8 text-base-content/60">
                          No applications yet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link href="/student/applications" className="btn btn-primary btn-sm">
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
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
                  <Link href="/student/profile" className="btn btn-outline btn-sm w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Edit Profile
                  </Link>
                  <Link href="/student/resume" className="btn btn-outline btn-sm w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Upload Resume
                  </Link>
                  <Link href="/student/drives" className="btn btn-outline btn-sm w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Us */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li>Placement Officer: +91 98765 43210</li>
                <li>Assistant Officer: +91 98765 43211</li>
                <li>Student Coordinator: +91 98765 43212</li>
              </ul>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="font-bold text-lg mb-4">Feedback</h3>
              <ul className="space-y-2">
                <li><Link href="/feedback/placement" className="link link-hover text-sm">Feedback of the Placement</Link></li>
                <li><Link href="/feedback/portal" className="link link-hover text-sm">Feedback of the Placement Portal</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="link link-hover text-sm">About Us</Link></li>
                <li><Link href="/placement-process" className="link link-hover text-sm">Placement Process</Link></li>
                <li><Link href="/recruiters" className="link link-hover text-sm">Recruiters</Link></li>
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="text-center">
            <p className="text-sm">Empowering students to achieve their career goals through world-class placement opportunities.</p>
            <p className="text-sm mt-2">© 2026 Placement Cell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
