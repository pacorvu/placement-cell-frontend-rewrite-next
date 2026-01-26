"use client";
import Link from "next/link";
import { Download } from "lucide-react";
import { useHandleLogout } from "@/components/HandleLogout";
import RoleGuard from "@/components/RoleGuard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
// SOCSE-specific data
const socseStats = {
  totalStrength: 304,
  opted: 240,
  fullTime: 15,
  internship: 29,
  ppo: 68,
  totalPlaced: 112,
  unplaced: 128,
  maxPackage: "₹45.5 LPA",
  avgPackage: "₹12.5 LPA",
  medianPackage: "₹11 LPA",
  participationRate: 78.9,
  placementRate: 46.7,
};
// Course-wise breakdown
const courseData = [
  {
    course: "B.Tech CSE",
    year: "4th Year",
    batchStrength: 120,
    optedIn: 115,
    placed: 68,
    internships: 0,
    ppo: 45,
    avgPackage: "₹13.2 LPA",
  },
  {
    course: "B.Tech CSE",
    year: "3rd Year",
    batchStrength: 130,
    optedIn: 125,
    placed: 29,
    internships: 29,
    ppo: 23,
    avgPackage: "₹8.5 LPA (Internship)",
  },
  {
    course: "B.Tech AI/ML",
    year: "4th Year",
    batchStrength: 54,
    optedIn: 54,
    placed: 15,
    internships: 0,
    ppo: 0,
    avgPackage: "₹14.8 LPA",
  },
];
// Company-wise placements
const topCompanies = [
  { company: "Amazon", students: 12, package: "₹28 LPA" },
  { company: "Microsoft", students: 8, package: "₹42 LPA" },
  { company: "Google", students: 5, package: "₹45.5 LPA" },
  { company: "Goldman Sachs", students: 7, package: "₹32 LPA" },
  { company: "Accenture", students: 15, package: "₹8 LPA" },
  { company: "TCS", students: 18, package: "₹7 LPA" },
  { company: "Infosys", students: 10, package: "₹6.5 LPA" },
  { company: "Wipro", students: 9, package: "₹6.8 LPA" },
];
// Package distribution
const packageDistribution = [
  { range: "₹0-5 LPA", count: 8 },
  { range: "₹5-10 LPA", count: 42 },
  { range: "₹10-15 LPA", count: 35 },
  { range: "₹15-25 LPA", count: 18 },
  { range: "₹25+ LPA", count: 9 },
];
// Placement type breakdown
const placementTypes = [
  { name: "Full Time", value: 15, color: "var(--chart-1)" },
  { name: "Internship", value: 29, color: "var(--chart-2)" },
  { name: "PPO", value: 68, color: "var(--chart-3)" },
];
// Trend data
const trendData = [
  { year: "2022", placed: 85, avgPackage: 9.2 },
  { year: "2023", placed: 98, avgPackage: 10.8 },
  { year: "2024", placed: 105, avgPackage: 11.5 },
  { year: "2025", placed: 112, avgPackage: 12.5 },
];
// Bar chart data for year-wise comparison
const barChartData = [
  { year: "3rd Year", opted: 125, placed: 29, unplaced: 96 },
  { year: "4th Year CSE", opted: 115, placed: 68, unplaced: 47 },
  { year: "4th Year AI/ML", opted: 54, placed: 15, unplaced: 39 },
];
export default function DeanSOCSEDashboard() {
  const handleDownload = (type: string) => {
    console.log(`Downloading ${type} report...`);
  };
  const Content = () => {
    const handleLogout = useHandleLogout();
    return (
      <div
        className="min-h-screen bg-background flex flex-col space-y-6 management"
        data-theme="light"
      >
        <header className="bg-base-100 shadow-sm border-b border-base-300 ">
          <div className="navbar max-w-7xl mx-auto px-4 lg:px-8">
            {/* Brand */}
            <Link href="/" className="btn btn-ghost text-xl normal-case">
              Placement Cell
            </Link>
            <div className="navbar-end gap-2 ml-auto">
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-error btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Placement Analytics & Insights - SOCSE DEAN
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time dashboard as of 1/18/2026
          </p>
        </div>
        <div className="container mx-auto p-6 space-y-6 management">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-sm opacity-70">
                  Total Strength
                </h2>
                <p className="text-4xl font-bold">{socseStats.totalStrength}</p>
                <p className="text-sm text-base-content/60">SOCSE Students</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-sm opacity-70">
                  Opted for Placement
                </h2>
                <p className="text-4xl font-bold">{socseStats.opted}</p>
                <p className="text-sm text-base-content/60">
                  {socseStats.participationRate}% Participation
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-sm opacity-70">Total Placed</h2>
                <p className="text-4xl font-bold">{socseStats.totalPlaced}</p>
                <p className="text-sm text-base-content/60">
                  {socseStats.placementRate}% Conversion Rate
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-sm opacity-70">
                  Average Package
                </h2>
                <p className="text-4xl font-bold">{socseStats.avgPackage}</p>
                <p className="text-sm text-base-content/60">
                  Max: {socseStats.maxPackage}
                </p>
              </div>
            </div>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Year-wise Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opted" fill="var(--chart-1)" name="Opted" />
                    <Bar dataKey="placed" fill="var(--chart-2)" name="Placed" />
                    <Bar
                      dataKey="unplaced"
                      fill="var(--chart-3)"
                      name="Unplaced"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Pie Chart */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Placement Type Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={placementTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="var(--primary)"
                      dataKey="value"
                      stroke="var(--background)"
                      strokeWidth={2}
                    >
                      {placementTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Trend Chart */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Placement Trends (2022-2025)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="placed"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    name="Students Placed"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgPackage"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    name="Avg Package (LPA)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Tabs Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div role="tablist" className="tabs tabs-bordered">
                <input
                  type="radio"
                  name="my_tabs"
                  role="tab"
                  className="tab"
                  aria-label="Course Details"
                  defaultChecked
                />
                <div role="tabpanel" className="tab-content pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Course-wise Breakdown</h2>
                    <button
                      onClick={() => handleDownload("course")}
                      className="btn btn-primary btn-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Year</th>
                          <th>Batch Strength</th>
                          <th>Opted In</th>
                          <th>Placed</th>
                          <th>Internships</th>
                          <th>PPO</th>
                          <th>Avg Package</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseData.map((row, idx) => (
                          <tr key={idx}>
                            <td className="font-semibold">{row.course}</td>
                            <td>{row.year}</td>
                            <td>{row.batchStrength}</td>
                            <td>{row.optedIn}</td>
                            <td>
                              <div className="">
                                {row.placed}
                              </div>
                            </td>
                            <td>{row.internships}</td>
                            <td>{row.ppo}</td>
                            <td className="font-semibold text-success">
                              {row.avgPackage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <input
                  type="radio"
                  name="my_tabs"
                  role="tab"
                  className="tab"
                  aria-label="Top Recruiters"
                />
                <div role="tabpanel" className="tab-content pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Top Recruiters</h2>
                    <button
                      onClick={() => handleDownload("companies")}
                      className="btn btn-primary btn-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Students Placed</th>
                          <th>Package Offered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCompanies.map((company, idx) => (
                          <tr key={idx}>
                            <td className="font-semibold">{company.company}</td>
                            <td>
                              <div className="">
                                {company.students}
                              </div>
                            </td>
                            <td className="font-semibold text-success">
                              {company.package}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <input
                  type="radio"
                  name="my_tabs"
                  role="tab"
                  className="tab"
                  aria-label="Package Distribution"
                />
                <div role="tabpanel" className="tab-content pt-6">
                  <h2 className="text-xl font-bold mb-4">
                    Package Distribution
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Package Range</th>
                          <th>Number of Students</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packageDistribution.map((pkg, idx) => (
                          <tr key={idx}>
                            <td className="font-semibold">{pkg.range}</td>
                            <td>
                              <div className="">
                                {pkg.count}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <progress
                                  className="progress progress-primary w-32"
                                  value={pkg.count}
                                  max={Math.max(
                                    ...packageDistribution.map((p) => p.count),
                                  )}
                                ></progress>
                                <span className="text-sm">
                                  {(
                                    (pkg.count / socseStats.totalPlaced) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Summary Stats */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Placement Summary</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Full Time Offers</div>
                  <div className="stat-value text-primary">
                    {socseStats.fullTime}
                  </div>
                  <div className="stat-desc">Direct placements</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Internship Offers</div>
                  <div className="stat-value text-secondary">
                    {socseStats.internship}
                  </div>
                  <div className="stat-desc">Summer internships</div>
                </div>
                <div className="stat">
                  <div className="stat-title">PPO Conversions</div>
                  <div className="stat-value text-accent">{socseStats.ppo}</div>
                  <div className="stat-desc">Pre-placement offers</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Unplaced</div>
                  <div className="stat-value">{socseStats.unplaced}</div>
                  <div className="stat-desc">Active candidates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <RoleGuard requiredRole="Management">
      <Content />
    </RoleGuard>
  );
}
