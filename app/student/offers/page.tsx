'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OfferStatus = 'pending' | 'accepted' | 'rejected';

export default function JobOffers() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OfferStatus>('pending');
  
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
              <li><Link href="/student/offers" className="active">Job Offers</Link></li>
              <li><Link href="/student/events">Events</Link></li>
              <li><Link href="/student/policy">Policy</Link></li>
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Job Offers</h1>
          <p className="text-base-content/60 mt-1">View and manage your job offers</p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-8">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
          >
            Pending (0)
          </button>
          <button 
            onClick={() => setActiveTab('accepted')}
            className={`tab ${activeTab === 'accepted' ? 'tab-active' : ''}`}
          >
            Accepted (0)
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`tab ${activeTab === 'rejected' ? 'tab-active' : ''}`}
          >
            Rejected (0)
          </button>
        </div>

        {/* Content */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            {activeTab === 'pending' && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-base-content mb-2">No pending offers</h3>
                <p className="text-base-content/60">Your pending job offers will appear here</p>
              </div>
            )}
            
            {activeTab === 'accepted' && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-base-content mb-2">No accepted offers yet</h3>
                <p className="text-base-content/60">Offers you accept will be listed here</p>
              </div>
            )}
            
            {activeTab === 'rejected' && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-base-content mb-2">No rejected offers</h3>
                <p className="text-base-content/60">Offers you decline will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
