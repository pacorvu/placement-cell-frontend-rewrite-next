import { AlumniProfile, AlumniProject } from "./alumni-types";

// Mock Alumni Data
export const mockAlumni: AlumniProfile[] = [
  {
    id: "1",
    usn: "1RVU19CSE001",
    name: "John Doe",
    email: "john.doe@gmail.com",
    phone: "9876543210",
    batchYear: 2023,
    batch: "Batch of 2023",
    department: "Computer Science and Engineering",
    currentEmployment: {
      company: "Google",
      designation: "Software Engineer",
      location: "Bangalore",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      portfolio: "https://johndoe.dev",
    },
    skills: ["Python", "React", "Node.js", "Machine Learning"],
  },
  {
    id: "2",
    usn: "1RVU19CSE014",
    name: "Jane Smith",
    email: "jane.smith@gmail.com",
    phone: "9876543211",
    batchYear: 2023,
    batch: "Batch of 2023",
    department: "Computer Science and Engineering",
    currentEmployment: {
      company: "Amazon",
      designation: "SDE-2",
      location: "Hyderabad",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/janesmith",
    },
    skills: ["Java", "AWS", "Microservices", "Kubernetes"],
  },
  {
    id: "3",
    usn: "1RVU19ECE045",
    name: "Rahul Kumar",
    email: "rahul.kumar@gmail.com",
    phone: "9876543212",
    batchYear: 2022,
    batch: "Batch of 2022",
    department: "Electronics and Communication Engineering",
    currentEmployment: {
      company: "Microsoft",
      designation: "Software Engineer II",
      location: "Bangalore",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/rahulkumar",
      github: "https://github.com/rahulk",
    },
    skills: ["C++", "Azure", "System Design", "Docker"],
  },
  {
    id: "4",
    usn: "1RVU19CSE078",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "9876543213",
    batchYear: 2023,
    batch: "Batch of 2023",
    department: "Computer Science and Engineering",
    currentEmployment: {
      company: "Goldman Sachs",
      designation: "Analyst",
      location: "Mumbai",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/priyasharma",
    },
    skills: ["Python", "Financial Modeling", "Data Analysis", "SQL"],
  },
  {
    id: "5",
    usn: "1RVU19CSE092",
    name: "Arjun Patel",
    email: "arjun.patel@gmail.com",
    phone: "9876543214",
    batchYear: 2022,
    batch: "Batch of 2022",
    department: "Computer Science and Engineering",
    currentEmployment: {
      company: "Adobe",
      designation: "Software Developer",
      location: "Noida",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/arjunpatel",
      portfolio: "https://arjunpatel.io",
    },
    skills: ["JavaScript", "React", "TypeScript", "Design Systems"],
  },
  {
    id: "6",
    usn: "1RVU19CSE103",
    name: "Sneha Reddy",
    email: "sneha.reddy@gmail.com",
    phone: "9876543215",
    batchYear: 2021,
    batch: "Batch of 2021",
    department: "Computer Science and Engineering",
    currentEmployment: {
      company: "Flipkart",
      designation: "Senior Software Engineer",
      location: "Bangalore",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/in/snehareddy",
    },
    skills: ["Java", "Spring Boot", "Redis", "Kafka"],
  },
];

// Mock Alumni Projects
export const mockAlumniProjects: AlumniProject[] = [
  {
    id: "1",
    title: "AI-Based Attendance System",
    description:
      "Using facial recognition to mark attendance automatically in classrooms.",
    technologies: ["Python", "OpenCV", "TensorFlow"],
    contributors: ["1RVU19CSE001", "1RVU19CSE014"],
    domain: "AI & Machine Learning",
    year: 2023,
  },
  {
    id: "2",
    title: "E-Commerce Analytics Dashboard",
    description:
      "Real-time analytics platform using Flink and Kafka for e-commerce data analysis.",
    technologies: ["React", "Node.js", "Apache Flink", "Kafka"],
    contributors: ["1RVU19CSE014"],
    domain: "Analytics",
    year: 2023,
  },
  {
    id: "3",
    title: "HealthCare Blockchain",
    description:
      "Secure patient data sharing using Ethereum blockchain technology.",
    technologies: ["Solidity", "Web3.js", "React", "IPFS"],
    contributors: ["1RVU19ECE045"],
    domain: "Blockchain",
    year: 2022,
  },
  {
    id: "4",
    title: "Sustainable Packaging Design",
    description:
      "Eco-friendly packaging solution for FMCG products with biodegradable materials.",
    technologies: ["Design Thinking", "Figma", "Prototyping"],
    contributors: ["1RVU19CSE092"],
    domain: "Design",
    year: 2022,
  },
  {
    id: "5",
    title: "Smart Traffic Management",
    description:
      "IoT-based traffic signal optimization using real-time vehicle detection.",
    technologies: ["IoT", "Python", "TensorFlow", "Arduino"],
    contributors: ["1RVU19CSE078"],
    domain: "IoT",
    year: 2023,
  },
  {
    id: "6",
    title: "Algorithmic Trading Bot",
    description:
      "ML-powered trading bot for predicting stock market trends and executing trades.",
    technologies: ["Python", "TensorFlow", "Pandas", "Alpha Vantage API"],
    contributors: ["1RVU19CSE103"],
    domain: "FinTech",
    year: 2021,
  },
];
