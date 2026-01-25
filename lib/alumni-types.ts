import { z } from "zod";

// Alumni Profile Schema
const alumniProfileSchema = z.object({
  id: z.string(),
  usn: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  photo: z.string().optional(),
  batchYear: z.number(),
  batch: z.string(),
  department: z.string(),

  currentEmployment: z.object({
    company: z.string(),
    designation: z.string(),
    location: z.string(),
    startDate: z.string().optional(),
  }),

  careerHistory: z
    .array(
      z.object({
        company: z.string(),
        designation: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
      })
    )
    .optional(),

  socialLinks: z
    .object({
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
      github: z.string().optional(),
      other: z.string().optional(),
    })
    .optional(),

  skills: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(), // Project IDs
});

// Alumni Project Schema
const alumniProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().optional(),
  technologies: z.array(z.string()),
  contributors: z.array(z.string()), // Alumni USNs
  externalLink: z.string().optional(),
  domain: z.string(),
  year: z.number(),
});

// Referral Submission Schema
const referralSubmissionSchema = z.object({
  jobDetails: z.object({
    company: z.string(),
    role: z.string(),
    description: z.string(),
    jobType: z.enum(["Full-time", "Internship", "Contract"]),
    experienceLevel: z.enum(["Entry", "Mid", "Senior"]),
    location: z.string(),
    salaryRange: z.string().optional(),
  }),

  hrContact: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
  }),

  additionalInfo: z.object({
    deadline: z.string().optional(),
    requiredSkills: z.string().optional(),
    notes: z.string().optional(),
  }),

  referringAlumni: z.object({
    usn: z.string(),
    name: z.string(),
    currentCompany: z.string(),
  }),

  submittedAt: z.string(),
});

// Export types
export type AlumniProfile = z.infer<typeof alumniProfileSchema>;
export type AlumniProject = z.infer<typeof alumniProjectSchema>;
export type ReferralSubmission = z.infer<typeof referralSubmissionSchema>;

// Export schemas
export { alumniProfileSchema, alumniProjectSchema, referralSubmissionSchema };
