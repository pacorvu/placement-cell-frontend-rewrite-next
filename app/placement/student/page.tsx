"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Search, Columns3, Download } from "lucide-react";

interface Student {
  usn: string;
  full_name: string;
  school_name: string;
  program_name: string;
  specialization_name: string;
  personal_email: string;
  phone_number?: string;
}

const MOCK_STUDENTS: Student[] = [
  { usn: "1RV21CS001", full_name: "Aarav Sharma", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Computer Science", personal_email: "aarav.sharma@gmail.com", phone_number: "9876543210" },
  { usn: "1RV21CS002", full_name: "Aditi Patel", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Computer Science", personal_email: "aditi.patel@gmail.com", phone_number: "9876543211" },
  { usn: "1RV21CS003", full_name: "Arjun Reddy", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Artificial Intelligence", personal_email: "arjun.reddy@gmail.com", phone_number: "9876543212" },
  { usn: "1RV21CS004", full_name: "Ananya Iyer", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Data Science", personal_email: "ananya.iyer@gmail.com", phone_number: "9876543213" },
  { usn: "1RV21CS005", full_name: "Rohan Gupta", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Computer Science", personal_email: "rohan.gupta@gmail.com", phone_number: "9876543214" },
  { usn: "1RV21EC006", full_name: "Priya Nair", school_name: "SoE", program_name: "B.Tech", specialization_name: "Electronics", personal_email: "priya.nair@gmail.com", phone_number: "9876543215" },
  { usn: "1RV21EC007", full_name: "Karthik Menon", school_name: "SoE", program_name: "B.Tech", specialization_name: "Electronics", personal_email: "karthik.menon@gmail.com", phone_number: "9876543216" },
  { usn: "1RV21MB008", full_name: "Sneha Agarwal", school_name: "SoB", program_name: "MBA", specialization_name: "Finance", personal_email: "sneha.agarwal@gmail.com", phone_number: "9876543217" },
  { usn: "1RV21MB009", full_name: "Vikram Singh", school_name: "SoB", program_name: "MBA", specialization_name: "Marketing", personal_email: "vikram.singh@gmail.com", phone_number: "9876543218" },
  { usn: "1RV21MB010", full_name: "Neha Verma", school_name: "SoB", program_name: "MBA", specialization_name: "HR", personal_email: "neha.verma@gmail.com", phone_number: "9876543219" },
  { usn: "1RV21CS011", full_name: "Aditya Kumar", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Cyber Security", personal_email: "aditya.kumar@gmail.com", phone_number: "9876543220" },
  { usn: "1RV21CS012", full_name: "Ishita Bansal", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Computer Science", personal_email: "ishita.bansal@gmail.com", phone_number: "9876543221" },
  { usn: "1RV21DS013", full_name: "Rahul Joshi", school_name: "SoD", program_name: "B.Des", specialization_name: "UI/UX Design", personal_email: "rahul.joshi@gmail.com", phone_number: "9876543222" },
  { usn: "1RV21DS014", full_name: "Kavya Rao", school_name: "SoD", program_name: "B.Des", specialization_name: "Product Design", personal_email: "kavya.rao@gmail.com", phone_number: "9876543223" },
  { usn: "1RV21CS015", full_name: "Siddharth Malhotra", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Machine Learning", personal_email: "siddharth.m@gmail.com", phone_number: "9876543224" },
  { usn: "1RV21CS016", full_name: "Meera Krishnan", school_name: "SoCSE", program_name: "B.Sc", specialization_name: "Computer Science", personal_email: "meera.k@gmail.com", phone_number: "9876543225" },
  { usn: "1RV21EC017", full_name: "Harsh Pandey", school_name: "SoE", program_name: "B.Tech", specialization_name: "VLSI Design", personal_email: "harsh.pandey@gmail.com", phone_number: "9876543226" },
  { usn: "1RV21MB018", full_name: "Divya Choudhary", school_name: "SoB", program_name: "BBA", specialization_name: "Business Analytics", personal_email: "divya.c@gmail.com", phone_number: "9876543227" },
  { usn: "1RV21LW019", full_name: "Akash Mehta", school_name: "SoLAS", program_name: "BA LLB", specialization_name: "Corporate Law", personal_email: "akash.mehta@gmail.com", phone_number: "9876543228" },
  { usn: "1RV21LW020", full_name: "Pooja Saxena", school_name: "SoLAS", program_name: "BA LLB", specialization_name: "Criminal Law", personal_email: "pooja.saxena@gmail.com", phone_number: "9876543229" },
  { usn: "1RV21CS021", full_name: "Varun Kapoor", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Cloud Computing", personal_email: "varun.kapoor@gmail.com", phone_number: "9876543230" },
  { usn: "1RV21CS022", full_name: "Riya Sharma", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Computer Science", personal_email: "riya.sharma@gmail.com", phone_number: "9876543231" },
  { usn: "1RV21MB023", full_name: "Nikhil Agrawal", school_name: "SoB", program_name: "MBA", specialization_name: "Operations", personal_email: "nikhil.a@gmail.com", phone_number: "9876543232" },
  { usn: "1RV21DS024", full_name: "Tanvi Desai", school_name: "SoD", program_name: "B.Des", specialization_name: "Graphic Design", personal_email: "tanvi.desai@gmail.com", phone_number: "9876543233" },
  { usn: "1RV21CS025", full_name: "Kunal Bhatt", school_name: "SoCSE", program_name: "B.Tech", specialization_name: "Full Stack Development", personal_email: "kunal.bhatt@gmail.com", phone_number: "9876543234" },
];

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "full_name", label: "NAME", alwaysVisible: true },
  { key: "usn", label: "USN", alwaysVisible: true },
  { key: "school_name", label: "SCHOOL" },
  { key: "program_name", label: "PROGRAM" },
  { key: "specialization_name", label: "SPECIALIZATION" },
  { key: "personal_email", label: "EMAIL" },
  { key: "phone_number", label: "CONTACT" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-lime-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function StudentsPage() {
  const router = useRouter();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(COLUMNS.map((c) => c.key))
  );

  // Unique filter values
  const schools = useMemo(() => {
    return [...new Set(MOCK_STUDENTS.map((s) => s.school_name))].sort();
  }, []);

  const programs = useMemo(() => {
    return [...new Set(MOCK_STUDENTS.map((s) => s.program_name))].sort();
  }, []);

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      const matchesSearch =
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.personal_email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = selectedSchool === "all" || student.school_name === selectedSchool;
      const matchesProgram = selectedProgram === "all" || student.program_name === selectedProgram;
      return matchesSearch && matchesSchool && matchesProgram;
    });
  }, [searchQuery, selectedSchool, selectedProgram]);

  const handleStudentClick = (usn: string) => {
    router.push(`/placement/student/${usn}`);
  };

  const toggleColumn = (key: string) => {
    const column = COLUMNS.find((c) => c.key === key);
    if (column?.alwaysVisible) return;

    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExport = () => {
    const headers = COLUMNS.filter((c) => visibleColumns.has(c.key))
      .map((c) => c.label)
      .join(",");

    const rows = filteredStudents.map((student, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return index + 1;
          return `"${student[c.key as keyof Student] || ""}"`;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Students</h1>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* School Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[150px] justify-between"
          >
            {selectedSchool === "all" ? "All Schools" : selectedSchool}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedSchool("all")}
                className={selectedSchool === "all" ? "active" : ""}
              >
                All Schools
              </a>
            </li>
            {schools.map((school) => (
              <li key={school}>
                <a
                  onClick={() => setSelectedSchool(school)}
                  className={selectedSchool === school ? "active" : ""}
                >
                  {school}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Program Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[150px] justify-between"
          >
            {selectedProgram === "all" ? "All Programs" : selectedProgram}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedProgram("all")}
                className={selectedProgram === "all" ? "active" : ""}
              >
                All Programs
              </a>
            </li>
            {programs.map((program) => (
              <li key={program}>
                <a
                  onClick={() => setSelectedProgram(program)}
                  className={selectedProgram === program ? "active" : ""}
                >
                  {program}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1" />

        {/* Column Visibility */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2"
          >
            <Columns3 className="h-4 w-4" />
            Columns
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {COLUMNS.map((column) => (
              <li key={column.key}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    disabled={column.alwaysVisible}
                    className="checkbox checkbox-sm"
                  />
                  {column.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Export */}
        <button onClick={handleExport} className="btn btn-outline gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="border border-base-300 rounded-lg overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-base-content/60">
            No students found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-base-200">
                {COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                  (column) => (
                    <TableHead
                      key={column.key}
                      className="font-semibold text-base-content"
                    >
                      {column.label}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow
                  key={student.usn}
                  className="cursor-pointer hover:bg-base-200/50"
                  onClick={() => handleStudentClick(student.usn)}
                >
                  {visibleColumns.has("index") && (
                    <TableCell className="text-base-content/60">
                      {index + 1}
                    </TableCell>
                  )}
                  {visibleColumns.has("full_name") && (
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(student.full_name)}`}
                        >
                          {getInitials(student.full_name)}
                        </div>
                        <span className="font-medium">{student.full_name}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.has("usn") && (
                    <TableCell>
                      <span className="badge badge-primary badge-sm font-mono">
                        {student.usn}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has("school_name") && (
                    <TableCell>{student.school_name}</TableCell>
                  )}
                  {visibleColumns.has("program_name") && (
                    <TableCell>{student.program_name}</TableCell>
                  )}
                  {visibleColumns.has("specialization_name") && (
                    <TableCell>{student.specialization_name}</TableCell>
                  )}
                  {visibleColumns.has("personal_email") && (
                    <TableCell className="text-primary">
                      {student.personal_email}
                    </TableCell>
                  )}
                  {visibleColumns.has("phone_number") && (
                    <TableCell>{student.phone_number || "-"}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-base-content/60">
        Showing {filteredStudents.length} of {MOCK_STUDENTS.length} students
      </div>
    </div>
  );
}
