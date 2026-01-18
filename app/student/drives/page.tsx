"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type DriveStatus =
  | "upcoming"
  | "ongoing"
  | "selected"
  | "attended"
  | "rejected";

export default function PlacementDrives() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DriveStatus>("upcoming");

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Placement Drives
          </h1>
          <p className="text-base-content/60 mt-1">
            View and apply for upcoming placement opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`tab ${activeTab === "upcoming" ? "tab-active" : ""}`}
          >
            Upcoming (0)
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`tab ${activeTab === "ongoing" ? "tab-active" : ""}`}
          >
            Ongoing (1)
          </button>
          <button
            onClick={() => setActiveTab("selected")}
            className={`tab ${activeTab === "selected" ? "tab-active" : ""}`}
          >
            Selected (1)
          </button>
          <button
            onClick={() => setActiveTab("attended")}
            className={`tab ${activeTab === "attended" ? "tab-active" : ""}`}
          >
            Attended (0)
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`tab ${activeTab === "rejected" ? "tab-active" : ""}`}
          >
            Rejected (2)
          </button>
        </div>

        {/* Content */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            {activeTab === "upcoming" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No upcoming drives available
                </h3>
                <p className="text-base-content/60">
                  Check back soon for new opportunities!
                </p>
              </div>
            )}

            {activeTab === "ongoing" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No ongoing drives
                </h3>
                <p className="text-base-content/60">
                  All your active applications will appear here
                </p>
              </div>
            )}

            {activeTab === "selected" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No selections yet
                </h3>
                <p className="text-base-content/60">
                  Keep applying and your selections will show up here
                </p>
              </div>
            )}

            {activeTab === "attended" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No attended drives
                </h3>
                <p className="text-base-content/60">
                  Drives you&apos;ve completed will be listed here
                </p>
              </div>
            )}

            {activeTab === "rejected" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No rejections
                </h3>
                <p className="text-base-content/60">
                  Don&apos;t give up! Every rejection is a step closer to
                  success
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
