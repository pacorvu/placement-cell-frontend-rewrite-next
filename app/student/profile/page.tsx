"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PersonalInformationForm from "./components/PersonalInformationForm";
import ContactInformationForm from "./components/ContactInformationForm";
import ParentGuardianDetailsForm from "./components/ParentGuardianDetailsForm";
import CareerOverviewForm from "./components/CareerOverviewForm";
import EducationHistoryForm from "./components/EducationHistoryForm";
import ResumeForm from "./components/ResumeForm";
import AcademicPerformanceForm from "./components/AcademicPerformanceForm";
import ProjectsForm from "./components/ProjectsForm";
import InternshipsForm from "./components/InternshipsForm";
import TrainingWorkshopsForm from "./components/TrainingWorkshopsForm";
import CertificationsForm from "./components/CertificationsForm";
import PublicationsForm from "./components/PublicationsForm";
import ExtraCurricularForm from "./components/ExtraCurricularForm";
import OtherExperiencesForm from "./components/OtherExperiencesForm";

const sidebarItems = [
  { 
    id: "personal", 
    label: "Personal Information", 
    hasData: true,
    icon: <i className="material-icons h-5 w-5">person</i>
  },
  { 
    id: "contact", 
    label: "Contact & Links", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">email</i>
  },
  { 
    id: "parent", 
    label: "Parent / Guardian Details", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">family_restroom</i>
  },
  { 
    id: "career", 
    label: "Career Overview", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">work</i>
  },
  { 
    id: "education", 
    label: "Education", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">school</i>
  },
  { 
    id: "academic", 
    label: "Academic Performance", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">bar_chart</i>
  },
  { 
    id: "projects", 
    label: "Projects", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">code</i>
  },
  { 
    id: "internships", 
    label: "Internships", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">business_center</i>
  },
  { 
    id: "training", 
    label: "Training & Workshops", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">local_library</i>
  },
  {
    id: "certifications",
    label: "Certifications",
    hasData: false,
    addable: true,
    icon: <i className="material-icons h-5 w-5">verified</i>
  },
  { 
    id: "publications", 
    label: "Publications", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">article</i>
  },
  { 
    id: "extracurricular", 
    label: "Extra-Curricular Activities", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">star</i>
  },
  { 
    id: "experiences", 
    label: "Other Experiences", 
    hasData: false, 
    addable: true,
    icon: <i className="material-icons h-5 w-5">work_outline</i>
  },
  { 
    id: "resume", 
    label: "Resume", 
    hasData: false,
    icon: <i className="material-icons h-5 w-5">description</i>
  },
];

export default function StudentProfile() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-base-200 border-r border-base-300">
          <div className="p-4">
            <h2 className="text-sm font-bold text-base-content/60 uppercase mb-4">
              Profile Sections
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center gap-3 ${
                    activeSection === item.id
                      ? "bg-primary text-primary-content font-medium"
                      : "hover:bg-base-300 text-base-content"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {/* {item.hasData && activeSection !== item.id && (
                    <span className="badge badge-success badge-xs"></span>
                  )} */}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Profile Header */}
          <div className="card bg-base-100 shadow border border-base-300 mb-6">
            <div className="card-body">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-24">
                        <span className="text-3xl">U</span>
                      </div>
                    </div>
                    <button className="btn btn-circle btn-sm btn-primary absolute -bottom-1 -right-1">
                      <i className="material-icons h-4 w-4">camera_alt</i>
                    </button>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-base-content">
                      Student Name
                    </h1>
                    <p className="text-base-content/60">student@test.com</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`btn ${isEditing ? "btn-primary" : "btn-outline btn-primary"}`}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active section */}
          {activeSection === "personal" && (
            <PersonalInformationForm isEditing={isEditing} />
          )}

          {activeSection === "contact" && (
            <ContactInformationForm isEditing={isEditing} />
          )}

          {activeSection === "parent" && (
            <ParentGuardianDetailsForm isEditing={isEditing} />
          )}

          {activeSection === "career" && (
            <CareerOverviewForm isEditing={isEditing} />
          )}

          {activeSection === "education" && (
            <EducationHistoryForm isEditing={isEditing} />
          )}

          {activeSection === "academic" && (
            <AcademicPerformanceForm isEditing={isEditing} />
          )}

          {activeSection === "projects" && (
            <ProjectsForm isEditing={isEditing} />
          )}

          {activeSection === "internships" && (
            <InternshipsForm isEditing={isEditing} />
          )}

          {activeSection === "training" && (
            <TrainingWorkshopsForm isEditing={isEditing} />
          )}

          {activeSection === "certifications" && (
            <CertificationsForm isEditing={isEditing} />
          )}

          {activeSection === "publications" && (
            <PublicationsForm isEditing={isEditing} />
          )}

          {activeSection === "extracurricular" && (
            <ExtraCurricularForm isEditing={isEditing} />
          )}

          {activeSection === "experiences" && (
            <OtherExperiencesForm isEditing={isEditing} />
          )}

          {activeSection === "resume" && (
            <ResumeForm isEditing={isEditing} />
          )}



          {/* For other sections */}
          {!sidebarItems.find((item) => item.id === activeSection)?.addable &&
            activeSection !== "personal" && (
              <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                  <div className="alert alert-info">
                    <i className="material-icons shrink-0 w-6 h-6">info</i>
                    <div>
                      <h3 className="font-bold">Section Incomplete</h3>
                      <div className="text-sm">
                        Complete this section to improve your profile visibility
                        to recruiters.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
