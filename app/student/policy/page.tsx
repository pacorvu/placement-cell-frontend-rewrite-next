'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PolicyPage() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
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
              <li><Link href="/student/dashboard">Dashboard</Link></li>
              <li><Link href="/student/profile">Profile</Link></li>
              <li><Link href="/student/drives">Placement Drives</Link></li>
              <li><Link href="/student/offers">Job Offers</Link></li>
              <li><Link href="/student/events">Events</Link></li>
              <li><Link href="/student/policy" className="active">Policy</Link></li>
            </ul>
          </div>
          <div className="navbar-end gap-2">
            <label className="input input-bordered input-sm hidden lg:flex items-center gap-2 w-64">
              <input type="text" placeholder="Search for jobs, pages..." className="grow" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </label>
            <button onClick={handleLogout} className="btn btn-primary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Placement Policy</h1>
          <p className="text-base-content/60 mt-1">Effective from Academic Year 2025-26</p>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            {/* Section 1: Eligibility Criteria */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
                <span className="badge badge-primary badge-lg">1</span>
                Eligibility Criteria
              </h2>
              
              <div className="space-y-3 ml-8">
                <div className="flex gap-3 items-start">
                  <span className="text-success">✓</span>
                  <p className="text-base-content/80">
                    Students must have a minimum CGPA of <strong>6.0</strong> with no active backlogs to register for placement drives.
                  </p>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="text-success">✓</span>
                  <p className="text-base-content/80">
                    Minimum <strong>75% attendance</strong> is required in all training sessions and workshops conducted by the placement cell.
                  </p>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="text-success">✓</span>
                  <p className="text-base-content/80">
                    Students must clear the internal assessments conducted before the placement season.
                  </p>
                </div>
              </div>
            </section>

            <div className="divider"></div>

            {/* Section 2: Registration & Participation */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
                <span className="badge badge-secondary badge-lg">2</span>
                Registration & Participation
              </h2>
              
              <div className="space-y-3 ml-8">
                <div className="flex gap-3 items-start">
                  <span className="text-info">ℹ</span>
                  <p className="text-base-content/80">
                    Registration for each company drive is <strong>mandatory</strong>. Students who register but do not appear for the process will be debarred from the next 2 opportunities.
                  </p>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="text-info">ℹ</span>
                  <p className="text-base-content/80">
                    Students must be in <strong>formal attire</strong> for all placement related activities.
                  </p>
                </div>
              </div>
            </section>

            <div className="divider"></div>

            {/* Section 3: Job Offers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
                <span className="badge badge-accent badge-lg">3</span>
                Job Offers
              </h2>
              
              <div className="space-y-3 ml-8">
                <div className="flex gap-3 items-start">
                  <span className="text-success">✓</span>
                  <p className="text-base-content/80">
                    <strong>One Student, One Offer</strong> policy: Once a student receives a job offer (above 5 LPA), they are considered placed and cannot apply for further companies.
                  </p>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="text-success">✓</span>
                  <p className="text-base-content/80">
                    <strong>Dream Offer</strong>: Placed students can apply for &quot;Dream Companies&quot; offering a package at least <strong>1.5x</strong> of their current offer.
                  </p>
                </div>
              </div>
            </section>

            {/* Important Note */}
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold">Important Note</h3>
                <p className="text-sm">The Placement Cell reserves the right to modify these policies. Students are advised to check the notice board and this portal regularly for updates.</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex gap-4 justify-center">
              <Link 
                href="/student/dashboard"
                className="btn btn-outline"
              >
                Back to Dashboard
              </Link>
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
