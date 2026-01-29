"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownToLine, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Data will be fetched from API
const MOCK_OFFERS: Array<{ student: string; company: string; role: string; ctc: string }> = [];

const MOCK_COMPANIES: Array<{ name: string; date: string; profile: string }> = [];

export default function ReportsPage() {
  // State
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [options, setOptions] = useState({
    jobOffers: true,
    companiesVisited: true,
    packageDetails: true,
  });
  const [reportGenerated, setReportGenerated] = useState(false);

  // Constants
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2025", "2026", "2027", "2028"];

  const handleGenerate = () => {
    const toastId = toast.loading("Generating report...");
    setTimeout(() => {
      setReportGenerated(true);
      toast.dismiss(toastId);
      toast.success(`Report generated for ${selectedMonth} ${selectedYear}`);
    }, 800);
  };

  const handleDownload = () => {
    toast.success("Downloading Excel report...");
  };

  const StatCard = ({ 
    title, 
    value, 
    colorClass 
  }: { 
    title: string; 
    value: string | number; 
    colorClass: string;
  }) => (
    <Card className="border-t-4 shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className={cn("text-3xl font-bold", colorClass)}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate stats
  const stats = {
    offers: options.jobOffers ? MOCK_OFFERS.length : 0,
    companies: options.companiesVisited ? MOCK_COMPANIES.length : 0,
    highestCTC: options.packageDetails && MOCK_OFFERS.length > 0 ? "52 LPA" : "0",
    avgCTC: options.packageDetails && MOCK_OFFERS.length > 0 ? "26.5 LPA" : "0",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Monthly Reports</h1>
          <p className="text-slate-500 mt-1">Generate and download placement reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* LEFT: SETTINGS PANEL */}
          <Card className="h-fit shadow-sm border border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {/* Select Period */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Select Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Include Data */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Include Data</label>
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2.5">
                    <Checkbox
                      id="opt-offers"
                      checked={options.jobOffers}
                      onCheckedChange={(c) => setOptions(prev => ({ ...prev, jobOffers: !!c }))}
                      className="border-slate-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <label 
                      htmlFor="opt-offers" 
                      className="text-sm text-slate-700 cursor-pointer select-none font-medium"
                    >
                      Job Offers
                    </label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Checkbox
                      id="opt-companies"
                      checked={options.companiesVisited}
                      onCheckedChange={(c) => setOptions(prev => ({ ...prev, companiesVisited: !!c }))}
                      className="border-slate-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <label 
                      htmlFor="opt-companies" 
                      className="text-sm text-slate-700 cursor-pointer select-none font-medium"
                    >
                      Companies Visited
                    </label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Checkbox
                      id="opt-package"
                      checked={options.packageDetails}
                      onCheckedChange={(c) => setOptions(prev => ({ ...prev, packageDetails: !!c }))}
                      className="border-slate-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <label 
                      htmlFor="opt-package" 
                      className="text-sm text-slate-700 cursor-pointer select-none font-medium"
                    >
                      Package Details
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGenerate}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-10 text-sm mt-1"
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT: PREVIEW PANEL */}
          <div className="space-y-6">
            {!reportGenerated ? (
              // EMPTY STATE
              <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 min-h-[500px] flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-20 h-20 mb-4 text-slate-300" strokeWidth={1.5} />
                <p className="text-base font-medium text-slate-400">
                  Select options and click Generate Report
                </p>
              </div>
            ) : (
              // GENERATED STATE
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="OFFERS" 
                    value={stats.offers} 
                    colorClass="text-emerald-600 border-t-emerald-500" 
                  />
                  <StatCard 
                    title="COMPANIES" 
                    value={stats.companies} 
                    colorClass="text-blue-600 border-t-blue-500" 
                  />
                  <StatCard 
                    title="HIGHEST CTC" 
                    value={stats.highestCTC} 
                    colorClass="text-amber-600 border-t-amber-500" 
                  />
                  <StatCard 
                    title="AVG CTC" 
                    value={stats.avgCTC} 
                    colorClass="text-purple-600 border-t-purple-500" 
                  />
                </div>

                {/* Preview Card */}
                <Card className="shadow-sm border border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        Report Preview: {selectedMonth} {selectedYear}
                      </CardTitle>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                    >
                      <ArrowDownToLine className="w-4 h-4" /> 
                      Download Excel
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    {/* Offers Table */}
                    {options.jobOffers && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Recent Offers
                        </h3>
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-bold text-slate-700 text-xs uppercase h-12">
                                  Student
                                </TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">
                                  Company
                                </TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">
                                  Role
                                </TableHead>
                                {options.packageDetails && (
                                  <TableHead className="font-bold text-slate-700 text-xs uppercase text-right">
                                    CTC
                                  </TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MOCK_OFFERS.length === 0 ? (
                                <TableRow>
                                  <TableCell 
                                    colSpan={options.packageDetails ? 4 : 3} 
                                    className="text-center text-slate-400 py-12 bg-slate-50"
                                  >
                                    No offers this month
                                  </TableCell>
                                </TableRow>
                              ) : (
                                MOCK_OFFERS.map((offer, i) => (
                                  <TableRow key={i} className="hover:bg-slate-50">
                                    <TableCell className="font-semibold text-slate-900">
                                      {offer.student}
                                    </TableCell>
                                    <TableCell className="text-slate-700">
                                      {offer.company}
                                    </TableCell>
                                    <TableCell className="text-slate-700">
                                      {offer.role}
                                    </TableCell>
                                    {options.packageDetails && (
                                      <TableCell className="text-right font-bold text-emerald-600">
                                        {offer.ctc}
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Companies Table */}
                    {options.companiesVisited && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                          Companies Visited
                        </h3>
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-bold text-slate-700 text-xs uppercase h-12">
                                  Company
                                </TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">
                                  Date
                                </TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">
                                  Profile
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MOCK_COMPANIES.map((company, i) => (
                                <TableRow key={i} className="hover:bg-slate-50">
                                  <TableCell className="font-semibold text-slate-900">
                                    {company.name}
                                  </TableCell>
                                  <TableCell className="text-slate-700">
                                    {company.date}
                                  </TableCell>
                                  <TableCell className="text-slate-700">
                                    {company.profile}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
