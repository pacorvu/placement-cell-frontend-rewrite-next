import { z } from "zod";

const personalDetailsSchema = z.object({
  usn: z.string(),
  full_name: z.string(),
  gender: z.string(),
  date_of_birth: z.string(),
  specially_abled: z.boolean(),
  languages: z.array(z.string().nullish().default("")),
  personal_email: z.string(),
  verification_type: z.string(),
  profile_image: z.string().nullish().default(""),
  school_name: z.string().nullish().default(""),
  year_of_joining: z.number(),
  program_name: z.string(),
  specialization_name: z.string(),
  major_name: z.string(),
  minor_name: z.string().nullish().default(""),
});

const profileDetailsSchema = z.object({
  brief_summary: z.string().default(""),
  key_expertise: z.string().default(""),
  hobbies_interests: z.string().default(""),
  career_objective: z.string().default(""),
  dream_package: z.number().default(0),
  dream_company: z.string().default(""),
});

const profileCommunicationSchema = z.object({
  college_email: z.string().default(""),
  personal_email: z.string().default(""),
  phone_country_code: z.string().default(""),
  phone_number: z.string().default(""),
  links: z.object({}).default({}),
});

const parentDetailsSchema = z.object({
  parent_type: z.string(),
  name: z.string(),
  occupation: z.string(),
  organisation: z.string(),
  email: z.string().nullish().default(""),
  phone_country_code: z.string().nullish().default(""),
  phone_number: z.string(),
});

const educationHistorySchema = z.object({
  education_level: z.string(),
  institute_name: z.string(),
  city: z.string(),
  board: z.string(),
  year_of_passing: z.number(),
  result: z.number(),
  result_type: z.string(),
  subjects: z.string(),
  marksheet_file: z.string().nullish().default(""),
  gap_type: z.string().nullish().default(""),
  gap_duration_months: z.number().nullish().default(0),
  gap_reason: z.string().nullish().default(""),
});

const semesterAcademicsSchema = z.object({
  academic_year: z.number(),
  semester: z.number(),
  result_in_sgpa: z.number(),
  closed_backlogs: z.number(),
  live_backlogs: z.number(),
  provisional_result_upload_link: z.array(z.string()).nullish().default([]),
});

const projectsSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.string(),
  project_link: z.string().nullish().default(""),
  snaps: z.string().nullish().default(""),
  mentor_name: z.string().nullish().default(""),
});

const internshipsSchema = z.object({
  job_role: z.string(),
  organization: z.string(),
  organization_details: z.string().nullish().default(""),
  duration_months: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string(),
  stipend: z.number().nullish().default(0),
  skills: z.string(),
  description: z.string(),
  mentor_name: z.string().nullish().default(""),
  proof_document: z.string().nullish().default(""),
});

const trainingsSchema = z.object({
  title: z.string(),
  institution: z.string(),
  training_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  skills: z.string(),
  description: z.string(),
  proof_document: z.string().nullish().default(""),
});

const certificationsSchema = z.object({
  title: z.string(),
  organization: z.string(),
  certification_type: z.string(),
  skills: z.string(),
  score: z.string().nullish().default(""),
  issue_date: z.string(),
  expiry_date: z.string().nullish().default(""),
  proof_document: z.string().nullish().default(""),
});

const publicationsSchema = z.object({
  title: z.string(),
  publication_name: z.string(),
  publication_type: z.string(),
  publication_date: z.string(),
  author_count: z.number(),
  mentor_name: z.string().nullish().default(""),
  skills: z.string(),
  description: z.string(),
  evidence_document: z.string().nullish().default(""),
});

const extraCurricularActivitiesSchema = z.object({
  activity_name: z.string(),
  activity_type: z.string(),
  role: z.string(),
  organization: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  achievements: z.string().nullish().default(""),
  skills: z.string(),
  description: z.string(),
  proof_document: z.string().nullish().default(""),
});

const otherExperiencesSchema = z.object({
  title: z.string(),
  organization: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string(),
  skills: z.string(),
  description: z.string(),
  proof_document: z.string().nullish().default(""),
});

export const requestSchema = z.object({
  user_id: z.number(),
  role_name: z.string(),
  personal_details: personalDetailsSchema,
  profile_details: profileDetailsSchema.nullish().default({
    brief_summary: "",
    key_expertise: "",
    hobbies_interests: "",
    career_objective: "",
    dream_package: 0,
    dream_company: "",
  }),
  profile_communication: profileCommunicationSchema.nullish().default({
    college_email: "",
    personal_email: "",
    phone_country_code: "",
    phone_number: "",
    links: {},
  }),
  parent_details: z.array(parentDetailsSchema),
  education_history: z.array(educationHistorySchema),
  semester_academics: z.array(semesterAcademicsSchema),
  projects: z.array(projectsSchema),
  internships: z.array(internshipsSchema),
  trainings: z.array(trainingsSchema),
  certifications: z.array(certificationsSchema),
  publications: z.array(publicationsSchema),
  extra_curricular_activities: z.array(extraCurricularActivitiesSchema),
  other_experiences: z.array(otherExperiencesSchema),
});

// Export the TypeScript type inferred from the schema
export type UserData = z.infer<typeof requestSchema>;

// Export individual types if needed
export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type ProfileDetails = z.infer<typeof profileDetailsSchema>;
export type ProfileCommunication = z.infer<typeof profileCommunicationSchema>;
export type ParentDetails = z.infer<typeof parentDetailsSchema>;
export type EducationHistory = z.infer<typeof educationHistorySchema>;
export type SemesterAcademics = z.infer<typeof semesterAcademicsSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Internships = z.infer<typeof internshipsSchema>;
export type Trainings = z.infer<typeof trainingsSchema>;
export type Certifications = z.infer<typeof certificationsSchema>;
export type Publications = z.infer<typeof publicationsSchema>;
export type ExtraCurricularActivities = z.infer<
  typeof extraCurricularActivitiesSchema
>;
export type OtherExperiences = z.infer<typeof otherExperiencesSchema>;
