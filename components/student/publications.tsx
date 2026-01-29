import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const publicationItemSchema = z.object({
	author_count: z.number().int(),
	created_at: z.string().datetime(),
	description: z.string(),
	evidence_document: z.string(),
	evidence_document_signed_url: z.string(),
	id: z.number().int(),
	mentor_name: z.string(),
	publication_date: z.string(),
	publication_name: z.string(),
	publication_type: z.string(),
	skills: z.array(z.string()),
	title: z.string(),
	updated_at: z.string().datetime(),
	user_id: z.number().int(),
	usn: z.string()
});

const getPublicationsResponseSchema = z.array(publicationItemSchema);

const createPublicationRequestSchema = z.object({
	author_count: z.number().int().nullable(),
	description: z.string().nullable(),
	evidence_document: z.string().nullable(),
	mentor_name: z.string().nullable(),
	publication_date: z.string().nullable(),
	publication_name: z.string().nullable(),
	publication_type: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	title: z.string(),
	user_id: z.number().int()
});

const updatePublicationRequestSchema = z.object({
	author_count: z.number().int().nullable(),
	description: z.string().nullable(),
	evidence_document: z.string().nullable(),
	mentor_name: z.string().nullable(),
	publication_date: z.string().nullable(),
	publication_name: z.string().nullable(),
	publication_type: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	title: z.string().nullable()
});

type PublicationItem = z.infer<typeof publicationItemSchema>;
type GetPublicationsResponse = z.infer<typeof getPublicationsResponseSchema>;
type CreatePublicationRequest = z.infer<typeof createPublicationRequestSchema>;
type UpdatePublicationRequest = z.infer<typeof updatePublicationRequestSchema>;

// Form values type for create
type CreateFormValues = {
	title: string;
	publication_name: string | null;
	publication_type: string | null;
	publication_date: string | null;
	author_count: number | null;
	mentor_name: string | null;
	skills: string[];
	description: string | null;
	evidence_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
	title: string | null;
	publication_name: string | null;
	publication_type: string | null;
	publication_date: string | null;
	author_count: number | null;
	mentor_name: string | null;
	skills: string[];
	description: string | null;
	evidence_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	author_count: true,
	description: true,
	evidence_document: true,
	mentor_name: true,
	publication_date: true,
	publication_name: true,
	publication_type: true,
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
					placeholder="Add a skill (e.g., Research, Writing)"
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

// ==================== ADD NEW PUBLICATION FORM ====================
interface AddPublicationFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddPublicationForm({
	userId,
	onSuccess,
	onError
}: AddPublicationFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: CreateFormValues = {
		author_count: null,
		description: null,
		evidence_document: null,
		mentor_name: null,
		publication_date: null,
		publication_name: null,
		publication_type: null,
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
			console.log("=== CREATING NEW PUBLICATION ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			formData.append("user_id", userId.toString());
			formData.append("title", values.title);

			if (values.publication_name !== null)
				formData.append("publication_name", values.publication_name);
			if (values.publication_type !== null)
				formData.append("publication_type", values.publication_type);
			if (values.publication_date !== null)
				formData.append("publication_date", values.publication_date);
			if (values.author_count !== null)
				formData.append("author_count", values.author_count.toString());
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);
			if (values.description !== null)
				formData.append("description", values.description);

			// Handle skills array
			if (values.skills.length > 0) {
				formData.append("skills", values.skills.join(","));
			}

			// Handle file separately
			if (values.evidence_document) {
				formData.append("evidence_document", values.evidence_document);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.post(`/publications/user`, formData, {
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
				queryKey: ["publications", userId]
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
		if (
			formValues.author_count !== null &&
			(formValues.author_count < 1 || formValues.author_count > 100)
		) {
			newErrors.author_count = "Author count must be between 1 and 100";
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
						Add Publication
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new publication
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
					{/* Title */}
					<FormField
						label="Publication Title"
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
							placeholder="e.g., Machine Learning Applications in Healthcare"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Publication Name and Type */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Publication Name" htmlFor="publication_name_new">
							<input
								id="publication_name_new"
								type="text"
								value={formValues.publication_name ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_name", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_name}
								placeholder="e.g., IEEE Journal, ACM Conference"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Publication Type" htmlFor="publication_type_new">
							<input
								id="publication_type_new"
								type="text"
								value={formValues.publication_type ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_type", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_type}
								placeholder="e.g., Journal, Conference, Workshop"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Publication Date and Author Count */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Publication Date" htmlFor="publication_date_new">
							<input
								id="publication_date_new"
								type="date"
								value={formValues.publication_date ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Number of Authors"
							htmlFor="author_count_new"
							error={errors.author_count}
						>
							<input
								id="author_count_new"
								type="number"
								value={formValues.author_count ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"author_count",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.author_count}
								placeholder="e.g., 3"
								min="1"
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
							placeholder="Enter mentor/supervisor name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills/Topics">
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
							placeholder="Describe the publication, its contribution, and key findings"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Evidence Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Evidence Document (Optional)
						</h5>

						<FormField
							label="Upload Publication/Evidence"
							htmlFor="evidence_document_new"
						>
							<input
								id="evidence_document_new"
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("evidence_document", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.evidence_document}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB. Formats: PDF, JPG, PNG
							</p>
							{formValues.evidence_document && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.evidence_document.name}
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
							Add Publication
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

// ==================== SINGLE PUBLICATION RECORD FORM ====================
interface PublicationRecordFormProps {
	record: PublicationItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function PublicationRecordForm({
	record,
	onSuccess,
	onError
}: PublicationRecordFormProps) {
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
			if (values.publication_name !== null)
				formData.append("publication_name", values.publication_name);
			if (values.publication_type !== null)
				formData.append("publication_type", values.publication_type);
			if (values.publication_date !== null)
				formData.append("publication_date", values.publication_date);
			if (values.author_count !== null)
				formData.append("author_count", values.author_count.toString());
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);
			if (values.description !== null)
				formData.append("description", values.description);

			// Handle skills array
			if (values.skills.length > 0) {
				formData.append("skills", values.skills.join(","));
			}

			// Handle file separately
			if (values.evidence_document) {
				formData.append("evidence_document", values.evidence_document);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.patch(`/publications/${record.id}`, formData, {
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
				queryKey: ["publications", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<UpdateFormValues>({
		author_count: record.author_count,
		description: record.description,
		evidence_document: null,
		mentor_name: record.mentor_name,
		publication_date: record.publication_date,
		publication_name: record.publication_name,
		publication_type: record.publication_type,
		skills: record.skills || [],
		title: record.title
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			author_count: record.author_count,
			description: record.description,
			evidence_document: null,
			mentor_name: record.mentor_name,
			publication_date: record.publication_date,
			publication_name: record.publication_name,
			publication_type: record.publication_type,
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
							{record.publication_name || "Publication name not set"} •{" "}
							{record.publication_type || "Type not set"} •{" "}
							{record.author_count
								? `${record.author_count} author${record.author_count > 1 ? "s" : ""}`
								: "Authors not specified"}
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
								className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
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

					{/* Title */}
					<FormField label="Publication Title" htmlFor={`title_${record.id}`}>
						<input
							id={`title_${record.id}`}
							type="text"
							value={formValues.title ?? ""}
							onChange={(e) =>
								handleFieldChange("title", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.title}
							placeholder="e.g., Machine Learning Applications in Healthcare"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Publication Name and Type */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Publication Name"
							htmlFor={`publication_name_${record.id}`}
						>
							<input
								id={`publication_name_${record.id}`}
								type="text"
								value={formValues.publication_name ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_name", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_name}
								placeholder="e.g., IEEE Journal, ACM Conference"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Publication Type"
							htmlFor={`publication_type_${record.id}`}
						>
							<input
								id={`publication_type_${record.id}`}
								type="text"
								value={formValues.publication_type ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_type", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_type}
								placeholder="e.g., Journal, Conference, Workshop"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Publication Date and Author Count */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Publication Date"
							htmlFor={`publication_date_${record.id}`}
						>
							<input
								id={`publication_date_${record.id}`}
								type="date"
								value={formValues.publication_date ?? ""}
								onChange={(e) =>
									handleFieldChange("publication_date", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.publication_date}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Number of Authors"
							htmlFor={`author_count_${record.id}`}
						>
							<input
								id={`author_count_${record.id}`}
								type="number"
								value={formValues.author_count ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"author_count",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.author_count}
								placeholder="e.g., 3"
								min="1"
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
							placeholder="Enter mentor/supervisor name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills/Topics">
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
							placeholder="Describe the publication, its contribution, and key findings"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Evidence Document */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Evidence Document
						</h5>

						{record.evidence_document_signed_url && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800 mb-2">
									Current publication document uploaded
								</p>
								<a
									href={record.evidence_document_signed_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									View Document
								</a>
							</div>
						)}

						<FormField
							label="Upload New Publication/Evidence"
							htmlFor={`evidence_document_${record.id}`}
						>
							<input
								id={`evidence_document_${record.id}`}
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("evidence_document", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.evidence_document}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							{formValues.evidence_document && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.evidence_document.name}
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
									author_count: record.author_count,
									description: record.description,
									evidence_document: null,
									mentor_name: record.mentor_name,
									publication_date: record.publication_date,
									publication_name: record.publication_name,
									publication_type: record.publication_type,
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
interface PublicationsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function PublicationsForm({
	userId,
	onSuccess,
	onError
}: PublicationsFormProps) {
	// Fetch publications
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetPublicationsResponse>(
				`/publications/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["publications", userId]
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
				Error loading publications: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Publications</h2>

			{/* Add New Publication Form */}
			<AddPublicationForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Publication Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<PublicationRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No publications found. Add your first publication above.
				</div>
			)}
		</div>
	);
}
