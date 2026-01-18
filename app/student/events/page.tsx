'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type EventTab = 'upcoming' | 'past' | 'registered';

interface Event {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'upcoming' | 'past' | 'registered';
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Pre-Placement Talk: Google',
    type: 'Seminar',
    date: '20/01/2026',
    time: '19:30',
    location: 'Virtual (Meet Link)',
    description: 'Google campus team visiting for pre-placement insights.',
    status: 'upcoming'
  },
  {
    id: 2,
    title: 'Codeathon 2026',
    type: 'Competition',
    date: '23/01/2026',
    time: '14:15',
    location: 'Main Auditorium',
    description: '24-hour coding hackathon with amazing prizes.',
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Soft Skills Workshop',
    type: 'Workshop',
    date: '28/01/2026',
    time: '14:15',
    location: 'Seminar Hall 2',
    description: 'Interactive session on communication and leadership skills.',
    status: 'upcoming'
  },
  {
    id: 4,
    title: 'Mock Interview Session - Phase 1',
    type: 'Interview',
    date: '05/02/2026',
    time: '14:30',
    location: 'Conference Room',
    description: 'Practice interviews with industry experts.',
    status: 'upcoming'
  }
];

export default function Events() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>('upcoming');
  
  const filteredEvents = mockEvents.filter(event => {
    if (activeTab === 'upcoming') return event.status === 'upcoming';
    if (activeTab === 'past') return event.status === 'past';
    if (activeTab === 'registered') return event.status === 'registered';
    return false;
  });

  const eventCounts = {
    upcoming: mockEvents.filter(e => e.status === 'upcoming').length,
    past: mockEvents.filter(e => e.status === 'past').length,
    registered: mockEvents.filter(e => e.status === 'registered').length,
  };

  return (
    <div className="min-h-screen bg-base-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Placement Events</h1>
          <p className="text-base-content/60 mt-1">Stay updated with upcoming events and workshops</p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-8">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`tab ${activeTab === 'upcoming' ? 'tab-active' : ''}`}
          >
            Upcoming ({eventCounts.upcoming})
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`tab ${activeTab === 'past' ? 'tab-active' : ''}`}
          >
            Past ({eventCounts.past})
          </button>
          <button 
            onClick={() => setActiveTab('registered')}
            className={`tab ${activeTab === 'registered' ? 'tab-active' : ''}`}
          >
            Registered ({eventCounts.registered})
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div 
              key={event.id}
              className="card bg-base-100 shadow border border-base-300"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="card-title text-base-content">{event.title}</h3>
                    <span className="badge badge-primary mt-1">{event.type}</span>
                  </div>
                  <span className="badge badge-info">UPCOMING</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-base-300">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-xs text-base-content/60">Date & Time</div>
                      <div className="font-medium text-base-content">{event.date} at {event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-xs text-base-content/60">Location</div>
                      <div className="font-medium text-base-content">{event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button className="btn btn-primary w-full md:w-auto">
                      Register Now
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-base-300">
                  <p className="text-base-content/70">{event.description}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-base-content mb-2">No {activeTab} events</h3>
                <p className="text-base-content/60">Check back later for new events!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
