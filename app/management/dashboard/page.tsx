"use client";
import Link from "next/link";
import { Download } from "lucide-react";
import { useHandleLogout } from "@/components/HandleLogout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import RoleGuard from "@/components/RoleGuard";
// Data for summary table
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
  {
    school: "SOLAS",
    totalStrength: 37,
    opted: 14,
    fullTime: 0,
    internship: 0,
    ppo: 0,
    totalPlaced: 0,
    unplaced: 14,
  },
  {
    school: "SOFMCA",
    totalStrength: 6,
    opted: 3,
    fullTime: 0,
    internship: 2,
    ppo: 0,
    totalPlaced: 2,
    unplaced: 1,
  },
  {
    school: "SOL",
    totalStrength: 36,
    opted: 36,
    fullTime: 0,
    internship: 0,
    ppo: 0,
    totalPlaced: 0,
    unplaced: 36,
  },
];

// Bar chart data
const barChartData = [
  { school: "SOCSE", opted: 240, placed: 112, unplaced: 128 },
  { school: "SOB-UG", opted: 128, placed: 15, unplaced: 113 },
  { school: "SOB-PG", opted: 167, placed: 36, unplaced: 131 },
  { school: "SODI", opted: 121, placed: 49, unplaced: 72 },
  { school: "SOE", opted: 14, placed: 0, unplaced: 14 },
  { school: "SOLAS", opted: 14, placed: 0, unplaced: 14 },
  { school: "SOFMCA", opted: 3, placed: 2, unplaced: 1 },
  { school: "SOL", opted: 36, placed: 0, unplaced: 36 },
];

// Pie chart data
const pieChartData = [
  { name: "Full Time", value: 29, color: "var(--chart-1)" },
  { name: "Internship", value: 73, color: "var(--chart-2)" },
  { name: "PPO", value: 112, color: "var(--chart-3)" },
];

// Detailed breakdown data
const detailedData = {
  SODI: {
    max: "₹8.5 LPA",
    avg: "₹6.25 LPA",
    paidInternships: 49,
    courses: [
      {
        course: "B Des",
        year: "1st Year",
        batchStrength: 210,
        placementMode: "Foundation",
        trained: "No",
        optedIn: "-",
        placed: "-",
      },
      {
        course: "B Des",
        year: "2nd Year",
        batchStrength: 206,
        placementMode: "Foundation",
        trained: "No",
        optedIn: "-",
        placed: "-",
      },
      {
        course: "B Des",
        year: "3rd Year",
        batchStrength: 92,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 92,
        placed: "-",
      },
      {
        course: "B Des",
        year: "4th Year",
        batchStrength: 113,
        placementMode: "Capstone & Final",
        trained: "Yes",
        optedIn: 89,
        placed: 39,
      },
      {
        course: "M Des",
        year: "1st Year",
        batchStrength: 37,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 37,
        placed: "-",
      },
      {
        course: "M Des",
        year: "2nd Year",
        batchStrength: 33,
        placementMode: "Capstone & Final",
        trained: "Yes",
        optedIn: 32,
        placed: 10,
      },
    ],
  },
  SOB: {
    max: "₹13 LPA",
    avg: "₹5.85 LPA",
    paidInternships: 46,
    courses: [
      {
        course: "BBA",
        year: "1st Year",
        batchStrength: 310,
        placementMode: "Summer Immersion",
        trained: "No",
        optedIn: "-",
        placed: "-",
      },
      {
        course: "BBA",
        year: "2nd Year",
        batchStrength: 158,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 158,
        placed: "-",
      },
      {
        course: "BBA",
        year: "3rd Year",
        batchStrength: 117,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 52,
        placed: 3,
      },
      {
        course: "BBA",
        year: "4th Year",
        batchStrength: 31,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 15,
        placed: "-",
      },
      {
        course: "B Com",
        year: "1st Year",
        batchStrength: 181,
        placementMode: "Summer Immersion",
        trained: "No",
        optedIn: "-",
        placed: "-",
      },
      {
        course: "B Com",
        year: "2nd Year",
        batchStrength: 176,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 176,
        placed: "-",
      },
      {
        course: "B Com",
        year: "3rd Year",
        batchStrength: 105,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 46,
        placed: 11,
      },
      {
        course: "B Com",
        year: "4th Year",
        batchStrength: 31,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 23,
        placed: 1,
      },
      {
        course: "MBA",
        year: "1st Year",
        batchStrength: 180,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 180,
        placed: "-",
      },
      {
        course: "MBA",
        year: "2nd Year",
        batchStrength: 167,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 165,
        placed: 31,
      },
    ],
  },
  SOE: {
    max: "₹0 LPA",
    avg: "₹0 LPA",
    paidInternships: 0,
    courses: [
      {
        course: "M Sc",
        year: "1st Year",
        batchStrength: 16,
        placementMode: "Summer Internship",
        trained: "No",
        optedIn: 16,
        placed: "-",
      },
      {
        course: "M Sc",
        year: "2nd Year",
        batchStrength: 14,
        placementMode: "Final Placement",
        trained: "No",
        optedIn: 13,
        placed: "-",
      },
      {
        course: "B Sc",
        year: "1st Year",
        batchStrength: 52,
        placementMode: "-",
        trained: "No",
        optedIn: "-",
        placed: "-",
      },
    ],
  },
  SOCSE: {
    max: "₹45.5 LPA",
    avg: "₹12.5 LPA",
    paidInternships: 85,
    courses: [
      {
        course: "B.Tech",
        year: "4th Year",
        batchStrength: 120,
        placementMode: "Final Placement",
        trained: "Yes",
        optedIn: 115,
        placed: 110,
      },
      {
        course: "B.Tech",
        year: "3rd Year",
        batchStrength: 130,
        placementMode: "Internship",
        trained: "Yes",
        optedIn: 125,
        placed: 85,
      },
    ],
  },
  SOL: {
    max: "₹12 LPA",
    avg: "₹8 LPA",
    paidInternships: 20,
    courses: [
      {
        course: "BA LLB",
        year: "5th Year",
        batchStrength: 40,
        placementMode: "Final Placement",
        trained: "Yes",
        optedIn: 36,
        placed: 30,
      },
    ],
  },
};

const barChartConfig = {
  opted: {
    label: "Opted",
    color: "var(--chart-1)",
  },
  placed: {
    label: "Placed",
    color: "var(--chart-2)",
  },
  unplaced: {
    label: "Unplaced",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function PlacementAnalytics() {
  const handleDownload = (type: string) => {
    console.log(`Downloading ${type} Excel...`);
    // Implement download logic here
  };

  const Content = () => {
    const handleLogout = useHandleLogout();
    return (
      <div className="min-h-screen bg-background flex flex-col space-y-6 management">
        <header
          className="bg-base-100 shadow-sm border-b border-base-300 "
          data-theme="light"
        >
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
            Placement Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time dashboard as of 1/18/2026
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Strength
                </p>
                <p className="text-3xl font-bold">1003</p>
                <p className="text-xs text-muted-foreground">
                  Across all schools
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Opted for Placement
                </p>
                <p className="text-3xl font-bold">723</p>
                <p className="text-xs text-muted-foreground">
                  72.1% Participation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Placed
                </p>
                <p className="text-3xl font-bold text-chart-2">214</p>
                <p className="text-xs text-muted-foreground">
                  29.6% Conversion Rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Paid Internships
                </p>
                <p className="text-3xl font-bold text-chart-1">200</p>
                <p className="text-xs text-muted-foreground">
                  Students with Stipend
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Bar Chart */}
          <Card className="lg:col-span-4 shadow-md">
            <CardHeader>
              <CardTitle>School-wise Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-75 w-full">
                <BarChart data={barChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="school"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="opted"
                    fill="var(--color-opted)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="placed"
                    fill="var(--color-placed)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="unplaced"
                    fill="var(--color-unplaced)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="lg:col-span-3 shadow-md">
            <CardHeader>
              <CardTitle>Placement Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
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
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <Card className="shadow-md">
          <Tabs defaultValue="summary" className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="summary"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Summary Report
                </TabsTrigger>
                <TabsTrigger
                  value="detailed"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Detailed Breakdown
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary" className="mt-0">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload("summary")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary Excel
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">
                          Total Strength
                        </TableHead>
                        <TableHead className="text-right">Opted</TableHead>
                        <TableHead className="text-right">Full Time</TableHead>
                        <TableHead className="text-right">Internship</TableHead>
                        <TableHead className="text-right">PPO</TableHead>
                        <TableHead className="text-right">
                          Total Placed
                        </TableHead>
                        <TableHead className="text-right">Unplaced</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.map((row) => (
                        <TableRow key={row.school}>
                          <TableCell className="font-medium">
                            {row.school}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.totalStrength}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.opted}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.fullTime}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.internship}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.ppo}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-chart-2">
                            {row.totalPlaced}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-chart-3">
                            {row.unplaced}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell className="text-right">1003</TableCell>
                        <TableCell className="text-right">723</TableCell>
                        <TableCell className="text-right">29</TableCell>
                        <TableCell className="text-right">73</TableCell>
                        <TableCell className="text-right">112</TableCell>
                        <TableCell className="text-right text-chart-2">
                          214
                        </TableCell>
                        <TableCell className="text-right text-chart-3">
                          509
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="detailed" className="mt-0">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload("detailed")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Detailed Excel
                  </Button>
                </div>

                <div className="space-y-8">
                  {Object.entries(detailedData).map(
                    ([schoolName, schoolData]) => (
                      <div key={schoolName} className="space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold">
                            {schoolName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="bg-(--chart-1)/10 text-chart-1 border-(--chart-1)/20"
                            >
                              Max: {schoolData.max}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-(--chart-2)/10 text-chart-2 border-(--chart-2)/20"
                            >
                              Avg: {schoolData.avg}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-(--chart-3)/10 text-chart-3 border-(--chart-3)/20"
                            >
                              Paid Internships: {schoolData.paidInternships}
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead className="text-right">
                                  Batch Strength
                                </TableHead>
                                <TableHead>Placement Mode</TableHead>
                                <TableHead>Trained</TableHead>
                                <TableHead className="text-right">
                                  Opted In
                                </TableHead>
                                <TableHead className="text-right">
                                  Placed
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {schoolData.courses.map((course, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {course.course}
                                  </TableCell>
                                  <TableCell>{course.year}</TableCell>
                                  <TableCell className="text-right">
                                    {course.batchStrength}
                                  </TableCell>
                                  <TableCell>{course.placementMode}</TableCell>
                                  <TableCell>{course.trained}</TableCell>
                                  <TableCell className="text-right">
                                    {course.optedIn}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-chart-2">
                                    {course.placed}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  };
  return (
    <RoleGuard requiredRole="Management">
      <Content />
    </RoleGuard>
  );
}
