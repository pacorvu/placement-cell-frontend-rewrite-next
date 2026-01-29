"use client";

import { useState, useMemo } from "react";
import { Star, ExternalLink, Search, Filter } from "lucide-react";

interface Project {
  id: number;
  title: string;
  category: string;
  author: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  isFavorite: boolean;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "AI Based Attendance System",
    category: "AI Project",
    author: "John Doe",
    description: "Using facial recognition to mark attendance automatically.",
    technologies: ["PYTHON", "OPENCV", "REACT"],
    githubUrl: "https://github.com/johndoe/ai-attendance",
    isFavorite: false,
  },
  {
    id: 2,
    title: "E-Commerce Analytics Dashboard",
    category: "Analytics",
    author: "Jane Smith",
    description: "Analyzing sales trends using PowerBI and React.",
    technologies: ["POWERBI", "REACT", "NODE.JS"],
    githubUrl: "https://github.com/janesmith/ecommerce-analytics",
    isFavorite: false,
  },
  {
    id: 3,
    title: "HealthCare Blockchain",
    category: "Blockchain",
    author: "A Shree Vyshnavi",
    description: "Secure patient data sharing using Ethereum blockchain.",
    technologies: ["SOLIDITY", "REACT", "NODE.JS"],
    githubUrl: "https://github.com/ashree/healthcare-blockchain",
    isFavorite: false,
  },
  {
    id: 4,
    title: "Sustainable Packaging Design",
    category: "Design",
    author: "Aadhira Muralidharan",
    description: "Eco-friendly packaging solutions for FMCG products.",
    technologies: ["ADOBE ILLUSTRATOR", "FIGMA"],
    githubUrl: "https://github.com/aadhira/sustainable-packaging",
    isFavorite: false,
  },
  {
    id: 5,
    title: "Smart Traffic Management",
    category: "IoT",
    author: "Aaron Elisha",
    description: "IoT based traffic light control system for smart cities.",
    technologies: ["IOT", "PYTHON", "C++"],
    githubUrl: "https://github.com/aaron/smart-traffic",
    isFavorite: false,
  },
  {
    id: 6,
    title: "Algorithmic Trading Bot",
    category: "FinTech",
    author: "Abhimanyu",
    description: "Automated trading strategies using Python and moving averages.",
    technologies: ["PYTHON", "PANDAS", "API"],
    githubUrl: "https://github.com/abhimanyu/trading-bot",
    isFavorite: false,
  },
  {
    id: 7,
    title: "AI Stock Predictor",
    category: "AI Stock",
    author: "Priya Sharma",
    description: "Machine learning model for stock price prediction.",
    technologies: ["PYTHON", "TENSORFLOW", "FLASK"],
    githubUrl: "https://github.com/priya/stock-predictor",
    isFavorite: false,
  },
  {
    id: 8,
    title: "EcoTrack Carbon Footprint",
    category: "EcoTrack",
    author: "Rahul Kumar",
    description: "Track and reduce your personal carbon footprint.",
    technologies: ["REACT", "NODE.JS", "MONGODB"],
    githubUrl: "https://github.com/rahul/ecotrack",
    isFavorite: false,
  },
  {
    id: 9,
    title: "Smart Home Automation",
    category: "Smart Home",
    author: "Sneha Patel",
    description: "Control home appliances remotely using IoT sensors.",
    technologies: ["ARDUINO", "REACT NATIVE", "FIREBASE"],
    githubUrl: "https://github.com/sneha/smart-home",
    isFavorite: false,
  },
];

const CATEGORIES = [
  "All",
  "AI Project",
  "Analytics",
  "Blockchain",
  "Design",
  "IoT",
  "FinTech",
  "AI Stock",
  "EcoTrack",
  "Smart Home",
];

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const toggleFavorite = (id: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesFavorite = !showFavoritesOnly || project.isFavorite;
      const matchesCategory =
        selectedCategory === "All" || project.category === selectedCategory;
      return matchesSearch && matchesFavorite && matchesCategory;
    });
  }, [projects, searchQuery, showFavoritesOnly, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Projects Gallery</h1>
          <p className="text-base-content/60 mt-1">
            Explore innovative projects built by our students.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium text-base-content/70">
            Show Favorites Only
          </span>
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
          />
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search by title, author, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-base-content/50" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered select-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Category Banner */}
            <div className="h-32 bg-base-200 flex items-center justify-center rounded-t-2xl">
              <span className="text-4xl font-bold text-base-content/20 tracking-wide">
                {project.category}
              </span>
            </div>

            <div className="card-body p-5">
              {/* Title & Favorite */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="card-title text-base font-semibold leading-tight">
                    {project.title}
                  </h2>
                  <p className="text-sm text-base-content/60 mt-0.5">
                    by {project.author}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(project.id)}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <Star
                    className={`h-4 w-4 ${
                      project.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-base-content/30"
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="badge badge-sm bg-base-200 text-base-content/80 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* View Project Button */}
              <div className="mt-4">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm w-full gap-2"
                >
                  View Project
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-16 text-base-content/60">
            <p className="text-lg">No projects found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
