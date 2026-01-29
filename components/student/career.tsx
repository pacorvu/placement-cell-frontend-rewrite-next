import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const certificationItemSchema = z.object({
	certification_type: z.string(),
	created_at: z.string().datetime(),
	expiry_date: z.string(),
	id: z.number().int(),
	issue_date: z.string(),
	organization: z.string(),
	proof_document: z.string(),
	proof_document_signed_url: z.string(),
	score: z.number(),
	skills: z.array(z.string()),
	title: z.string(),
	updated_at: z.string().datetime(),
	user_id: z.number().int(),
	usn: z.string()
});

const getCertificationsResponseSchema = z.array(certificationItemSchema);

const createCertificationsRequestSchema = z.object({
	certification_type: z.string().nullable(),
	expiry_date: z.string().nullable(),
	issue_date: z.string().nullable(),
	organization: z.string(),
	proof_document: z.string().nullable(),
	score: z.number().nullable(),
	skills: z.array(z.string()).nullable(),
	title: z.string(),
	user_id: z.number().int()
});

const updateCertificationsRequestSchema = z.object({
	certification_type: z.string().nullable(),
	expiry_date: z.string().nullable(),
	issue_date: z.string().nullable(),
	organization: z.string().nullable(),
	proof_document: z.string().nullable(),
	score: z.number().nullable(),
	skills: z.array(z.string()).nullable(),
	title: z.string().nullable()
});

type CertificationItem = z.infer<typeof certificationItemSchema>;
type GetCertificationsResponse = z.infer<
	typeof getCertificationsResponseSchema
>;
type CreateCertificationsRequest = z.infer<
	typeof createCertificationsRequestSchema
>;
type UpdateCertificationsRequest = z.infer<
	typeof updateCertificationsRequestSchema
>;

// Form values type for create
type CreateFormValues = {
	title: string;
	organization: string;
	certification_type: string | null;
	skills: string[];
	score: number | null;
	issue_date: string | null;
	expiry_date: string | null;
	proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
	title: string | null;
	organization: string | null;
	certification_type: string | null;
	skills: string[];
	score: number | null;
	issue_date: string | null;
	expiry_date: string | null;
	proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	certification_type: true,
	expiry_date: true,
	issue_date: true,
	organization: true,
	proof_document: true,
	score: true,
	skills: true,
	title: true
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
	required?: boolean;
	children: React.ReactNode;
}

function FormField({
	label,
	htmlFor,
	error,
	required,
	children
}: FormFieldProps) {
	return (
		<div>
			<label
				htmlFor={htmlFor}
				className="block text-sm font-medium text-gray-700 mb-1"
			>
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			{children}
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
}

// ==================== ADD NEW CERTIFICATION FORM ====================
interface AddCertificationFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddCertificationForm({
	userId,
	onSuccess,
	onError
}: AddCertificationFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: CreateFormValues = {
		certification_type: null,
		expiry_date: null,
		issue_date: null,
		organization: "",
		proof_document: null,
		score: null,
		skills: [],
		title: ""
	};

	const [formValues, setFormValues] =
		useState<CreateFormValues>(initialFormValues);

	const [errors, setErrors] = useState<
		Partial<Record<keyof CreateFormValues, string>>
	>({});
	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: CreateFormValues) => {
			console.log("=== CREATING NEW CERTIFICATION ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			formData.append("user_id", userId.toString());
			formData.append("title", values.title);
			formData.append("organization", values.organization);

			if (values.certification_type !== null)
				formData.append("certification_type", values.certification_type);
			if (values.score !== null)
				formData.append("score", values.score.toString());
			if (values.issue_date !== null)
				formData.append("issue_date", values.issue_date);
			if (values.expiry_date !== null)
				formData.append("expiry_date", values.expiry_date);

			// Handle skills array
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

			const response = await api.post(`/certifications/user`, formData, {
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
				queryKey: ["certifications", userId]
			});
			setFormValues(initialFormValues);
			setErrors({});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof CreateFormValues, string>> = {};

		if (!formValues.title.trim()) {
			newErrors.title = "Title is required";
		}
		if (!formValues.organization.trim()) {
			newErrors.organization = "Organization is required";
		}
		if (
			formValues.score !== null &&
			(formValues.score < 0 || formValues.score > 100)
		) {
			newErrors.score = "Score must be between 0 and 100";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("=== FORM SUBMIT ===");
		console.log("Current form values:", formValues);

		if (!validateForm()) {
			return;
		}

		await createMutation.mutateAsync(formValues);
	};

	const handleFieldChange = <K extends keyof CreateFormValues>(
		field: K,
		value: CreateFormValues[K]
	) => {
		console.log(`Field ${field} changed to:`, value);
		setFormValues((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
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
						Add New Certification
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new certification
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
					{/* Title and Organization */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Certification Title"
							htmlFor="title_new"
							required
							error={errors.title}
						>
							<input
								id="title_new"
								type="text"
								value={formValues.title}
								onChange={(e) => handleFieldChange("title", e.target.value)}
								disabled={!FIELD_PERMISSIONS.title}
								placeholder="e.g., AWS Certified Solutions Architect"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Issuing Organization"
							htmlFor="organization_new"
							required
							error={errors.organization}
						>
							<input
								id="organization_new"
								type="text"
								value={formValues.organization}
								onChange={(e) =>
									handleFieldChange("organization", e.target.value)
								}
								disabled={!FIELD_PERMISSIONS.organization}
								placeholder="e.g., Amazon Web Services"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Certification Type and Score */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Certification Type"
							htmlFor="certification_type_new"
						>
							<input
								id="certification_type_new"
								type="text"
								value={formValues.certification_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"certification_type",
										e.target.value || null
									)
								}
								disabled={!FIELD_PERMISSIONS.certification_type}
								placeholder="e.g., Professional, Associate"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Score" htmlFor="score_new" error={errors.score}>
							<input
								id="score_new"
								type="number"
								step="0.01"
								value={formValues.score ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"score",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.score}
								placeholder="e.g., 85.5"
								min="0"
								max="100"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Issue Date and Expiry Date */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Issue Date" htmlFor="issue_date_new">
							<input
								id="issue_date_new"
								type="date"
								value={formValues.issue_date ?? ""}
								onChange={(e) =>
									handleFieldChange("issue_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.issue_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Expiry Date" htmlFor="expiry_date_new">
							<input
								id="expiry_date_new"
								type="date"
								value={formValues.expiry_date ?? ""}
								onChange={(e) =>
									handleFieldChange("expiry_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.expiry_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Skills */}
					<FormField label="Skills Covered">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Proof Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Proof Document (Optional)
						</h5>

						<FormField
							label="Upload Certification Document"
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
							Add Certification
						</button>
						<button
							type="button"
							onClick={() => {
								setFormValues(initialFormValues);
								setErrors({});
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

// ==================== SINGLE CERTIFICATION RECORD FORM ====================
interface CertificationRecordFormProps {
	record: CertificationItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function CertificationRecordForm({
	record,
	onSuccess,
	onError
}: CertificationRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Update mutation - using FormData
	const updateMutation = useMutation({
		mutationFn: async (values: UpdateFormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			if (values.title !== null) formData.append("title", values.title);
			if (values.organization !== null)
				formData.append("organization", values.organization);
			if (values.certification_type !== null)
				formData.append("certification_type", values.certification_type);
			if (values.score !== null)
				formData.append("score", values.score.toString());
			if (values.issue_date !== null)
				formData.append("issue_date", values.issue_date);
			if (values.expiry_date !== null)
				formData.append("expiry_date", values.expiry_date);

			// Handle skills array
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

			const response = await api.patch(
				`/certifications/${record.id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data"
					}
				}
			);
			console.log("Response:", response.data);
			return response.data;
		},
		onError: (error: any) => {
			console.error("Update error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["certifications", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<UpdateFormValues>({
		certification_type: record.certification_type,
		expiry_date: record.expiry_date,
		issue_date: record.issue_date,
		organization: record.organization,
		proof_document: null,
		score: record.score,
		skills: record.skills || [],
		title: record.title
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			certification_type: record.certification_type,
			expiry_date: record.expiry_date,
			issue_date: record.issue_date,
			organization: record.organization,
			proof_document: null,
			score: record.score,
			skills: record.skills || [],
			title: record.title
		});
	}, [record]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("=== FORM SUBMIT ===");
		console.log("Current form values:", formValues);
		await updateMutation.mutateAsync(formValues);
	};

	const handleFieldChange = <K extends keyof UpdateFormValues>(
		field: K,
		value: UpdateFormValues[K]
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
							{record.title}
						</h4>
						<p className="text-sm text-gray-600 mt-1">
							{record.organization} •{" "}
							{record.issue_date
								? new Date(record.issue_date).getFullYear()
								: "No date"}
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

					{/* Title and Organization */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Certification Title"
							htmlFor={`title_${record.id}`}
						>
							<input
								id={`title_${record.id}`}
								type="text"
								value={formValues.title ?? ""}
								onChange={(e) =>
									handleFieldChange("title", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.title}
								placeholder="e.g., AWS Certified Solutions Architect"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Issuing Organization"
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
								placeholder="e.g., Amazon Web Services"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Certification Type and Score */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Certification Type"
							htmlFor={`certification_type_${record.id}`}
						>
							<input
								id={`certification_type_${record.id}`}
								type="text"
								value={formValues.certification_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"certification_type",
										e.target.value || null
									)
								}
								disabled={!FIELD_PERMISSIONS.certification_type}
								placeholder="e.g., Professional, Associate"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Score" htmlFor={`score_${record.id}`}>
							<input
								id={`score_${record.id}`}
								type="number"
								step="0.01"
								value={formValues.score ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"score",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.score}
								placeholder="e.g., 85.5"
								min="0"
								max="100"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Issue Date and Expiry Date */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Issue Date" htmlFor={`issue_date_${record.id}`}>
							<input
								id={`issue_date_${record.id}`}
								type="date"
								value={formValues.issue_date ?? ""}
								onChange={(e) =>
									handleFieldChange("issue_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.issue_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Expiry Date" htmlFor={`expiry_date_${record.id}`}>
							<input
								id={`expiry_date_${record.id}`}
								type="date"
								value={formValues.expiry_date ?? ""}
								onChange={(e) =>
									handleFieldChange("expiry_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.expiry_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Skills */}
					<FormField label="Skills Covered">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Proof Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">Proof Document</h5>

						{record.proof_document_signed_url && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800 mb-2">
									Current certification document uploaded
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
							label="Upload New Certification Document"
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
									certification_type: record.certification_type,
									expiry_date: record.expiry_date,
									issue_date: record.issue_date,
									organization: record.organization,
									proof_document: null,
									score: record.score,
									skills: record.skills || [],
									title: record.title
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
interface CertificationsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function CertificationsForm({
	userId,
	onSuccess,
	onError
}: CertificationsFormProps) {
	// Fetch certifications
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetCertificationsResponse>(
				`/certifications/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["certifications", userId]
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
				Error loading certifications: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h2>

			{/* Add New Certification Form */}
			<AddCertificationForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Certification Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<CertificationRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No certifications found. Add your first certification above.
				</div>
			)}
		</div>
	);
}
