// c:\Users\apoor\Downloads\frontend\placement-cell-frontend-rewrite-next\app\placement\dashboard\page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PlacementDashboard() {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // ...existing data structures...
  const summaryData = [
    {
      school: "SOCSE",
      totalStrength: 304,
      opted: 240,
      fullTime: 15,
      internship: 29,
      ppo: 68,
      totalPlaced: 112,
      unplaced: 128,
    },
    {
      school: "SOB-UG",
      totalStrength: 284,
      opted: 128,
      fullTime: 0,
      internship: 0,
      ppo: 15,
      totalPlaced: 15,
      unplaced: 113,
    },
    {
      school: "SOB-PG",
      totalStrength: 167,
      opted: 167,
      fullTime: 9,
      internship: 0,
      ppo: 27,
      totalPlaced: 36,
      unplaced: 131,
    },
    {
      school: "SODI",
      totalStrength: 147,
      opted: 121,
      fullTime: 5,
      internship: 42,
      ppo: 2,
      totalPlaced: 49,
      unplaced: 72,
    },
    {
      school: "SOE",
      totalStrength: 22,
      opted: 14,
      fullTime: 0,
      internship: 0,
      ppo: 0,
      totalPlaced: 0,
      unplaced: 14,
    },
  ];

  const ctcData = [
    { range: "7-10 LPA", count: 2 },
    { range: "10-15 LPA", count: 2 },
    { range: "15-20 LPA", count: 1 },
    { range: "20+ LPA", count: 0 },
  ];

  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Flipkart",
    "Adobe",
    "Goldman Sachs",
    "JP Morgan",
    "Morgan Stanley",
    "Deloitte",
    "KPMG",
    "PwC",
    "Accenture",
    "Infosys",
    "TCS",
    "Wipro",
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-base-content">
            Admin Overview
          </h2>
          <p className="text-base-content/60">
            Key metrics and placement statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <p className="text-sm font-semibold text-base-content/70">
                Total Placement Seeking Students
              </p>
              <h3 className="text-4xl font-bold text-primary">16</h3>
            </div>
          </div>

          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <p className="text-sm font-semibold text-base-content/70">
                Total Drives
              </p>
              <h3 className="text-4xl font-bold text-info">5</h3>
            </div>
          </div>

          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <p className="text-sm font-semibold text-base-content/70">
                Ongoing Drives
              </p>
              <h3 className="text-4xl font-bold text-warning">2</h3>
              {/* <p className="text-xs text-base-content/50 mt-2">
                Actively hiring
              </p> */}
            </div>
          </div>

          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <p className="text-sm font-semibold text-base-content/70">
                Upcoming Drives
              </p>
              <h3 className="text-4xl font-bold text-success">1</h3>
              {/* <p className="text-xs text-base-content/50 mt-2">
                Scheduled next
              </p> */}
            </div>
          </div>
        </div>

        {/* Placement Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-200 shadow-md lg:col-span-2">
            <div className="card-body">
              <h3 className="card-title text-lg">Placement by Offer Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title text-xs">TOTAL OFFERS</div>
                  <div className="stat-value text-2xl text-primary">5</div>
                  <div className="stat-desc text-xs">100.00%</div>
                </div>
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title text-xs">FULL TIME</div>
                  <div className="stat-value text-2xl text-success">3</div>
                  <div className="stat-desc text-xs">60.00%</div>
                </div>
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title text-xs">INTERNSHIPS</div>
                  <div className="stat-value text-2xl text-warning">2</div>
                  <div className="stat-desc text-xs">40.00%</div>
                </div>
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title text-xs">PPO</div>
                  <div className="stat-value text-2xl text-info">0</div>
                  <div className="stat-desc text-xs">0.00%</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTC Summary */}
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg">CTC Summary</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/70">
                    Highest CTC
                  </span>
                  <span className="font-bold text-success">25 LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/70">
                    Average CTC
                  </span>
                  <span className="font-bold text-info">14.50 LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/70">
                    Lowest CTC
                  </span>
                  <span className="font-bold text-warning">7 LPA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTC Chart */}
        <div className="card bg-base-200 shadow-md mb-8">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              Placement Frequency by CTC Range
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ctcData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* School Filter */}
        {/* <div className="card bg-base-200 shadow-md mb-8">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              Total Students School-wise
            </h3>
            <p className="text-sm text-base-content/60 mb-4">
              Click on schools to filter. Select multiple schools to view
              combined statistics.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {summaryData.map((item) => (
                <button
                  key={item.school}
                  onClick={() => {
                    setSelectedSchools((prev) =>
                      prev.includes(item.school)
                        ? prev.filter((s) => s !== item.school)
                        : [...prev, item.school],
                    );
                  }}
                  className={`btn btn-sm ${
                    selectedSchools.includes(item.school)
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  <span className="text-xs">{item.school}</span>
                  <span className="text-lg font-bold">
                    {item.totalStrength}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div> */}

        {/* Placement by School Table */}
        <div className="card bg-base-200 shadow-md mb-8">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Placement by School</h3>
            <p className="text-sm text-base-content/60 mb-4">
              School-wise placement summary
            </p>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr className="bg-primary text-primary-content">
                    <th>School</th>
                    <th>Total Students</th>
                    <th>Full Time</th>
                    <th>Internship</th>
                    <th>PPO</th>
                    <th>Total Offers</th>
                    <th>Offer %</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((item) => (
                    <tr key={item.school} className="hover:bg-base-300">
                      <td className="font-semibold">{item.school}</td>
                      <td>{item.totalStrength}</td>
                      <td>
                        <span className="badge badge-success">
                          {item.fullTime}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-warning">
                          {item.internship}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{item.ppo}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {item.totalPlaced}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {(
                            (item.totalPlaced / item.totalStrength) *
                            100
                          ).toFixed(2)}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary text-primary-content font-bold">
                    <td>TOTAL</td>
                    <td>
                      {summaryData.reduce(
                        (sum, item) => sum + item.totalStrength,
                        0,
                      )}
                    </td>
                    <td>
                      {summaryData.reduce(
                        (sum, item) => sum + item.fullTime,
                        0,
                      )}
                    </td>
                    <td>
                      {summaryData.reduce(
                        (sum, item) => sum + item.internship,
                        0,
                      )}
                    </td>
                    <td>
                      {summaryData.reduce((sum, item) => sum + item.ppo, 0)}
                    </td>
                    <td>
                      {summaryData.reduce(
                        (sum, item) => sum + item.totalPlaced,
                        0,
                      )}
                    </td>
                    <td>
                      {(
                        (summaryData.reduce(
                          (sum, item) => sum + item.totalPlaced,
                          0,
                        ) /
                          summaryData.reduce(
                            (sum, item) => sum + item.totalStrength,
                            0,
                          )) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hiring Partners */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title text-lg">
                Hiring Partners{" "}
                <span className="text-sm font-normal text-base-content/60">
                  ({companies.length} Companies)
                </span>
              </h3>
              <Link
                href="/placement/companies"
                className="btn btn-xs btn-ghost"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-3 py-4 px-2">
                {companies.map((company) => (
                  <div
                    key={company}
                    className="badge badge-lg badge-outline shrink-0"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
