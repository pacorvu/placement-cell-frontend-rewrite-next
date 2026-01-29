import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const internshipItemSchema = z.object({
	created_at: z.string().datetime(),
	description: z.string().nullable(),
	duration_months: z.number().nullable(),
	end_date: z.string().date().nullable(),
	id: z.number(),
	job_role: z.string().nullable(),
	location: z.string().nullable(),
	mentor_name: z.string().nullable(),
	organization: z.string().nullable(),
	organization_details: z.string().nullable(),
	proof_document: z.string().nullable(),
	proof_document_signed_url: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	start_date: z.string().date().nullable(),
	stipend: z.number().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string()
});

const getInternshipsResponseSchema = z.array(internshipItemSchema);

const createInternshipRequestSchema = z.object({
	description: z.string().nullable().optional(),
	duration_months: z.number().int().nullable().optional(),
	end_date: z.string().date().nullable().optional(),
	job_role: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	mentor_name: z.string().nullable().optional(),
	organization: z.string().nullable().optional(),
	organization_details: z.string().nullable().optional(),
	proof_document: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 10 * 1024 * 1024,
			"File must be less than 10MB"
		)
		.refine(
			(file) =>
				["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
					file.type
				),
			"Only PDF and image files allowed"
		)
		.nullable()
		.optional(),
	skills: z.array(z.string()).nullable().optional(),
	start_date: z.string().date().nullable().optional(),
	stipend: z.number().nullable().optional()
});

const createInternshipResponseSchema = z.object({
	created_at: z.string().datetime(),
	description: z.string().nullable(),
	duration_months: z.number().nullable(),
	end_date: z.string().date().nullable(),
	id: z.number(),
	job_role: z.string().nullable(),
	location: z.string().nullable(),
	mentor_name: z.string().nullable(),
	organization: z.string().nullable(),
	organization_details: z.string().nullable(),
	proof_document: z.string().nullable(),
	proof_document_signed_url: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	start_date: z.string().date().nullable(),
	stipend: z.number().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string()
});

type InternshipItem = z.infer<typeof internshipItemSchema>;
type GetInternshipsResponse = z.infer<typeof getInternshipsResponseSchema>;
type CreateInternshipRequest = z.infer<typeof createInternshipRequestSchema>;
type CreateInternshipResponse = z.infer<typeof createInternshipResponseSchema>;

// Form values type
type FormValues = {
	job_role: string | null;
	organization: string | null;
	organization_details: string | null;
	duration_months: number | null;
	start_date: string | null;
	end_date: string | null;
	location: string | null;
	stipend: number | null;
	skills: string[];
	description: string | null;
	mentor_name: string | null;
	proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	description: true,
	duration_months: true,
	end_date: true,
	job_role: true,
	location: true,
	mentor_name: true,
	organization: true,
	organization_details: true,
	proof_document: true,
	skills: true,
	start_date: true,
	stipend: true
} as const;

// ==================== HELPER COMPONENTS ====================
interface SkillsInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	disabled: boolean;
}

function SkillsInput({ value, onChange, disabled }: SkillsInputProps) {
	const [skillInput, setSkillInput] = useState("");

	const addSkill = () => {
		if (skillInput.trim() && !value.includes(skillInput.trim())) {
			onChange([...value, skillInput.trim()]);
			setSkillInput("");
		}
	};

	const removeSkill = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div>
			<div className="flex gap-2 mb-2">
				<input
					type="text"
					value={skillInput}
					onChange={(e) => setSkillInput(e.target.value)}
					placeholder="Add a skill (e.g., React, Python)"
					disabled={disabled}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addSkill();
						}
					}}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				<button
					type="button"
					onClick={addSkill}
					disabled={disabled || !skillInput.trim()}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					Add
				</button>
			</div>
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((skill, index) => (
						<div
							key={index}
							className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
						>
							<span className="text-sm">{skill}</span>
							<button
								type="button"
								onClick={() => removeSkill(index)}
								disabled={disabled}
								className="text-blue-600 hover:text-blue-800 font-bold disabled:cursor-not-allowed"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

interface FormFieldProps {
	label: string;
	htmlFor?: string;
	error?: string;
	children: React.ReactNode;
}

function FormField({ label, htmlFor, error, children }: FormFieldProps) {
	return (
		<div>
			<label
				htmlFor={htmlFor}
				className="block text-sm font-medium text-gray-700 mb-1"
			>
				{label}
			</label>
			{children}
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
}

// ==================== ADD NEW INTERNSHIP RECORD FORM ====================
interface AddInternshipRecordFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddInternshipRecordForm({
	userId,
	onSuccess,
	onError
}: AddInternshipRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: FormValues = {
		description: null,
		duration_months: null,
		end_date: null,
		job_role: null,
		location: null,
		mentor_name: null,
		organization: null,
		organization_details: null,
		proof_document: null,
		skills: [],
		start_date: null,
		stipend: null
	};

	const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log("=== CREATING NEW INTERNSHIP ===");
			console.log("Values:", values);
			console.log(values.skills.join(","));

			// Create FormData
			const formData = new FormData();

			// Append all fields to FormData
			if (values.job_role !== null)
				formData.append("job_role", values.job_role);
			if (values.organization !== null)
				formData.append("organization", values.organization);
			if (values.organization_details !== null)
				formData.append("organization_details", values.organization_details);
			if (values.duration_months !== null)
				formData.append("duration_months", values.duration_months.toString());
			if (values.start_date !== null)
				formData.append("start_date", values.start_date);
			if (values.end_date !== null)
				formData.append("end_date", values.end_date);
			if (values.location !== null)
				formData.append("location", values.location);
			if (values.stipend !== null)
				formData.append("stipend", values.stipend.toString());
			if (values.description !== null)
				formData.append("description", values.description);
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);

			// Handle skills array
			if (values.skills !== null && Array.isArray(values.skills)) {
				formData.append("skills", values.skills.join(","));
			}

			formData.append("user_id", userId.toString());

			// Handle file separately
			if (values.proof_document) {
				formData.append("proof_document", values.proof_document);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.post(`/internships/user`, formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				}
			});
			console.log("Response:", response.data);
			return response.data;
		},
		onError: (error: any) => {
			console.error("Create error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["internships", userId]
			});
			setFormValues(initialFormValues);
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("=== FORM SUBMIT ===");
		console.log("Current form values:", formValues);
		await createMutation.mutateAsync(formValues);
	};

	const handleFieldChange = <K extends keyof FormValues>(
		field: K,
		value: FormValues[K]
	) => {
		console.log(`Field ${field} changed to:`, value);
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="border-2 border-dashed border-blue-300 rounded-lg overflow-hidden bg-blue-50/30">
			{/* Header */}
			<div
				className="bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-blue-100"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex-1">
					<h4 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add New Internship
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new internship experience
					</p>
				</div>
				<button
					type="button"
					className="text-blue-600 hover:text-blue-800"
					onClick={(e) => {
						e.stopPropagation();
						setIsExpanded(!isExpanded);
					}}
				>
					<svg
						className={`w-6 h-6 transition-transform ${
							isExpanded ? "rotate-180" : ""
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			{/* Expandable Form */}
			{isExpanded && (
				<form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
					{/* Job Role and Organization */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Job Role" htmlFor="job_role_new">
							<input
								id="job_role_new"
								type="text"
								value={formValues.job_role ?? ""}
								onChange={(e) =>
									handleFieldChange("job_role", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.job_role}
								placeholder="e.g., Software Development Intern"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Organization" htmlFor="organization_new">
							<input
								id="organization_new"
								type="text"
								value={formValues.organization ?? ""}
								onChange={(e) =>
									handleFieldChange("organization", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.organization}
								placeholder="Enter organization name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Organization Details */}
					<FormField
						label="Organization Details"
						htmlFor="organization_details_new"
					>
						<textarea
							id="organization_details_new"
							value={formValues.organization_details ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"organization_details",
									e.target.value || null
								)
							}
							disabled={!FIELD_PERMISSIONS.organization_details}
							placeholder="Brief description of the organization"
							rows={2}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Duration, Location, Stipend */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormField label="Duration (Months)" htmlFor="duration_months_new">
							<input
								id="duration_months_new"
								type="number"
								value={formValues.duration_months ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"duration_months",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.duration_months}
								placeholder="6"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Location" htmlFor="location_new">
							<input
								id="location_new"
								type="text"
								value={formValues.location ?? ""}
								onChange={(e) =>
									handleFieldChange("location", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.location}
								placeholder="Bangalore, India"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Stipend (₹)" htmlFor="stipend_new">
							<input
								id="stipend_new"
								type="number"
								value={formValues.stipend ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"stipend",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.stipend}
								placeholder="15000"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Start and End Dates */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Start Date" htmlFor="start_date_new">
							<input
								id="start_date_new"
								type="date"
								value={formValues.start_date ?? ""}
								onChange={(e) =>
									handleFieldChange("start_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.start_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="End Date" htmlFor="end_date_new">
							<input
								id="end_date_new"
								type="date"
								value={formValues.end_date ?? ""}
								onChange={(e) =>
									handleFieldChange("end_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.end_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Mentor Name */}
					<FormField label="Mentor Name" htmlFor="mentor_name_new">
						<input
							id="mentor_name_new"
							type="text"
							value={formValues.mentor_name ?? ""}
							onChange={(e) =>
								handleFieldChange("mentor_name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.mentor_name}
							placeholder="Enter mentor's name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Description */}
					<FormField label="Description" htmlFor="description_new">
						<textarea
							id="description_new"
							value={formValues.description ?? ""}
							onChange={(e) =>
								handleFieldChange("description", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.description}
							placeholder="Describe your role and responsibilities"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Proof Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Proof Document (Optional)
						</h5>

						<FormField
							label="Upload Proof Document"
							htmlFor="proof_document_new"
						>
							<input
								id="proof_document_new"
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("proof_document", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.proof_document}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB. Formats: PDF, JPG, PNG
							</p>
							{formValues.proof_document && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.proof_document.name}
								</p>
							)}
						</FormField>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4 pt-4 border-t border-gray-200">
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{createMutation.isPending && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							)}
							Create Internship
						</button>
						<button
							type="button"
							onClick={() => {
								setFormValues(initialFormValues);
								setIsExpanded(false);
							}}
							disabled={createMutation.isPending}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

// ==================== SINGLE INTERNSHIP RECORD FORM ====================
interface InternshipRecordFormProps {
	record: InternshipItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function InternshipRecordForm({
	record,
	onSuccess,
	onError
}: InternshipRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Update mutation - using FormData
	const updateMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			// Append all fields to FormData
			if (values.job_role !== null)
				formData.append("job_role", values.job_role);
			if (values.organization !== null)
				formData.append("organization", values.organization);
			if (values.organization_details !== null)
				formData.append("organization_details", values.organization_details);
			if (values.duration_months !== null)
				formData.append("duration_months", values.duration_months.toString());
			if (values.start_date !== null)
				formData.append("start_date", values.start_date);
			if (values.end_date !== null)
				formData.append("end_date", values.end_date);
			if (values.location !== null)
				formData.append("location", values.location);
			if (values.stipend !== null)
				formData.append("stipend", values.stipend.toString());
			if (values.description !== null)
				formData.append("description", values.description);
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);

			if (values.skills.length > 0) {
				formData.append("skills", values.skills.join(","));
			}

			// Handle file separately
			if (values.proof_document) {
				formData.append("proof_document", values.proof_document);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.patch(`/internships/${record.id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				}
			});
			console.log("Response:", response.data);
			return response.data;
		},
		onError: (error: any) => {
			console.error("Update error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["internships", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<FormValues>({
		description: record.description,
		duration_months: record.duration_months,
		end_date: record.end_date,
		job_role: record.job_role,
		location: record.location,
		mentor_name: record.mentor_name,
		organization: record.organization,
		organization_details: record.organization_details,
		proof_document: null,
		skills: record.skills || [],
		start_date: record.start_date,
		stipend: record.stipend
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			description: record.description,
			duration_months: record.duration_months,
			end_date: record.end_date,
			job_role: record.job_role,
			location: record.location,
			mentor_name: record.mentor_name,
			organization: record.organization,
			organization_details: record.organization_details,
			proof_document: null,
			skills: record.skills || [],
			start_date: record.start_date,
			stipend: record.stipend
		});
	}, [record]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("=== FORM SUBMIT ===");
		console.log("Current form values:", formValues);
		await updateMutation.mutateAsync(formValues);
	};

	const handleFieldChange = <K extends keyof FormValues>(
		field: K,
		value: FormValues[K]
	) => {
		console.log(`Field ${field} changed to:`, value);
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			{/* Header */}
			<div
				className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center justify-between mb-2">
					<div className="flex-1">
						<h4 className="font-semibold text-lg text-gray-900">
							{record.job_role || "Job Role Not Set"}
						</h4>
						<p className="text-sm text-gray-600 mt-1">
							{record.organization || "Organization not set"} •{" "}
							{record.duration_months
								? `${record.duration_months} months`
								: "Duration not set"}
						</p>
					</div>
					<button
						type="button"
						className="text-gray-500 hover:text-gray-700"
						onClick={(e) => {
							e.stopPropagation();
							setIsExpanded(!isExpanded);
						}}
					>
						<svg
							className={`w-6 h-6 transition-transform ${
								isExpanded ? "rotate-180" : ""
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>

				{/* Display skills in header */}
				{record.skills && record.skills.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{record.skills.map((skill, idx) => (
							<span
								key={idx}
								className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
							>
								{skill}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Expandable Form */}
			{isExpanded && (
				<form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
					{/* Read-only fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								ID
							</label>
							<input
								type="text"
								value={record.id}
								disabled
								className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								USN
							</label>
							<input
								type="text"
								value={record.usn}
								disabled
								className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
							/>
						</div>
					</div>

					{/* Job Role and Organization */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Job Role" htmlFor={`job_role_${record.id}`}>
							<input
								id={`job_role_${record.id}`}
								type="text"
								value={formValues.job_role ?? ""}
								onChange={(e) =>
									handleFieldChange("job_role", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.job_role}
								placeholder="e.g., Software Development Intern"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Organization"
							htmlFor={`organization_${record.id}`}
						>
							<input
								id={`organization_${record.id}`}
								type="text"
								value={formValues.organization ?? ""}
								onChange={(e) =>
									handleFieldChange("organization", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.organization}
								placeholder="Enter organization name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Organization Details */}
					<FormField
						label="Organization Details"
						htmlFor={`organization_details_${record.id}`}
					>
						<textarea
							id={`organization_details_${record.id}`}
							value={formValues.organization_details ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"organization_details",
									e.target.value || null
								)
							}
							disabled={!FIELD_PERMISSIONS.organization_details}
							placeholder="Brief description of the organization"
							rows={2}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Duration, Location, Stipend */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormField
							label="Duration (Months)"
							htmlFor={`duration_months_${record.id}`}
						>
							<input
								id={`duration_months_${record.id}`}
								type="number"
								value={formValues.duration_months ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"duration_months",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.duration_months}
								placeholder="6"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Location" htmlFor={`location_${record.id}`}>
							<input
								id={`location_${record.id}`}
								type="text"
								value={formValues.location ?? ""}
								onChange={(e) =>
									handleFieldChange("location", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.location}
								placeholder="Bangalore, India"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Stipend (₹)" htmlFor={`stipend_${record.id}`}>
							<input
								id={`stipend_${record.id}`}
								type="number"
								value={formValues.stipend ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"stipend",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.stipend}
								placeholder="15000"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Start and End Dates */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Start Date" htmlFor={`start_date_${record.id}`}>
							<input
								id={`start_date_${record.id}`}
								type="date"
								value={formValues.start_date ?? ""}
								onChange={(e) =>
									handleFieldChange("start_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.start_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="End Date" htmlFor={`end_date_${record.id}`}>
							<input
								id={`end_date_${record.id}`}
								type="date"
								value={formValues.end_date ?? ""}
								onChange={(e) =>
									handleFieldChange("end_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.end_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Mentor Name */}
					<FormField label="Mentor Name" htmlFor={`mentor_name_${record.id}`}>
						<input
							id={`mentor_name_${record.id}`}
							type="text"
							value={formValues.mentor_name ?? ""}
							onChange={(e) =>
								handleFieldChange("mentor_name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.mentor_name}
							placeholder="Enter mentor's name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Description */}
					<FormField label="Description" htmlFor={`description_${record.id}`}>
						<textarea
							id={`description_${record.id}`}
							value={formValues.description ?? ""}
							onChange={(e) =>
								handleFieldChange("description", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.description}
							placeholder="Describe your role and responsibilities"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Proof Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">Proof Document</h5>

						{record.proof_document_signed_url && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800 mb-2">
									Current proof document uploaded
								</p>
								<a
									href={record.proof_document_signed_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									View Document
								</a>
							</div>
						)}

						<FormField
							label="Upload New Proof Document"
							htmlFor={`proof_document_${record.id}`}
						>
							<input
								id={`proof_document_${record.id}`}
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("proof_document", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.proof_document}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							{formValues.proof_document && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.proof_document.name}
								</p>
							)}
						</FormField>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4 pt-4 border-t border-gray-200">
						<button
							type="submit"
							disabled={updateMutation.isPending}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{updateMutation.isPending && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							)}
							Save Changes
						</button>
						<button
							type="button"
							onClick={() => {
								setFormValues({
									description: record.description,
									duration_months: record.duration_months,
									end_date: record.end_date,
									job_role: record.job_role,
									location: record.location,
									mentor_name: record.mentor_name,
									organization: record.organization,
									organization_details: record.organization_details,
									proof_document: null,
									skills: record.skills || [],
									start_date: record.start_date,
									stipend: record.stipend
								});
								setIsExpanded(false);
							}}
							disabled={updateMutation.isPending}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

// ==================== MAIN COMPONENT ====================
interface InternshipFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function InternshipForm({
	userId,
	onSuccess,
	onError
}: InternshipFormProps) {
	// Fetch internships
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetInternshipsResponse>(
				`/internships/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["internships", userId]
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg">
				Error loading internships: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Internships</h2>

			{/* Add New Internship Form */}
			<AddInternshipRecordForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Internship Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<InternshipRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No internship records found. Add your first internship above.
				</div>
			)}
		</div>
	);
}
