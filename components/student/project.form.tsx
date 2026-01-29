import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const projectItemSchema = z.object({
	created_at: z.string().datetime(),
	description: z.string().nullable(),
	id: z.number(),
	mentor_name: z.string().nullable(),
	project_link: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	snaps: z.array(z.string()).nullable(),
	snaps_signed_urls: z.array(z.string()).nullable(),
	title: z.string().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string()
});

const getProjectsResponseSchema = z.array(projectItemSchema);

const createProjectRequestSchema = z.object({
	description: z.string().nullable().optional(),
	mentor_name: z.string().nullable().optional(),
	project_link: z.string().nullable().optional(),
	skills: z.array(z.string()).nullable().optional(),
	snaps: z
		.array(
			z
				.instanceof(File)
				.refine(
					(file) => file.size <= 10 * 1024 * 1024,
					"Each file must be less than 10MB"
				)
				.refine(
					(file) =>
						["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
							file.type
						),
					"Only image files allowed"
				)
		)
		.nullable()
		.optional(),
	title: z.string().nullable().optional()
});

const createProjectResponseSchema = z.object({
	created_at: z.string().datetime(),
	description: z.string().nullable(),
	id: z.number(),
	mentor_name: z.string().nullable(),
	project_link: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	snaps: z.array(z.string()).nullable(),
	snaps_signed_urls: z.array(z.string()).nullable(),
	title: z.string().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string()
});

type ProjectItem = z.infer<typeof projectItemSchema>;
type GetProjectsResponse = z.infer<typeof getProjectsResponseSchema>;
type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>;

// Form values type
type FormValues = {
	title: string | null;
	description: string | null;
	skills: string[];
	project_link: string | null;
	mentor_name: string | null;
	snaps: File[];
	replace_snaps: boolean;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	description: true,
	mentor_name: true,
	project_link: true,
	replace_snaps: true,
	skills: true,
	snaps: true,
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

interface ImagePreviewProps {
	images: string[];
	onRemove?: (index: number) => void;
	disabled?: boolean;
}

function ImagePreview({ images, onRemove, disabled }: ImagePreviewProps) {
	if (images.length === 0) return null;

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
			{images.map((url, index) => (
				<div key={index} className="relative group">
					<img
						src={url}
						alt={`Preview ${index + 1}`}
						className="w-full h-32 object-cover rounded-lg border border-gray-200"
					/>
					{onRemove && !disabled && (
						<button
							type="button"
							onClick={() => onRemove(index)}
							className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
				</div>
			))}
		</div>
	);
}

// ==================== ADD NEW PROJECT FORM ====================
interface AddProjectFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddProjectForm({ userId, onSuccess, onError }: AddProjectFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	// Initial empty form values
	const initialFormValues: FormValues = {
		description: null,
		mentor_name: null,
		project_link: null,
		replace_snaps: false,
		skills: [],
		snaps: [],
		title: null
	};

	const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log("=== CREATING NEW PROJECT ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			// Append all fields to FormData
			if (values.title !== null) formData.append("title", values.title);
			if (values.description !== null)
				formData.append("description", values.description);
			if (values.project_link !== null)
				formData.append("project_link", values.project_link);
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);

			// Handle skills array
			if (values.skills.length > 0) {
				formData.append("skills", values.skills.join(","));
			}

			formData.append("user_id", userId.toString());

			// Handle image files
			if (values.snaps.length > 0) {
				values.snaps.forEach((file) => {
					formData.append("snaps", file);
				});
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.post(`/projects/user`, formData, {
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
				queryKey: ["projects", userId]
			});
			setFormValues(initialFormValues);
			setPreviewUrls([]);
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

	const handleImagesChange = (files: FileList | null) => {
		if (!files) return;

		const newFiles = Array.from(files);
		handleFieldChange("snaps", [...formValues.snaps, ...newFiles]);

		// Create preview URLs
		const newUrls = newFiles.map((file) => URL.createObjectURL(file));
		setPreviewUrls((prev) => [...prev, ...newUrls]);
	};

	const removeImage = (index: number) => {
		// Revoke object URL to prevent memory leaks
		URL.revokeObjectURL(previewUrls[index]);

		setFormValues((prev) => ({
			...prev,
			snaps: prev.snaps.filter((_, i) => i !== index)
		}));
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
	};

	// Cleanup preview URLs on unmount
	useEffect(() => {
		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

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
						Add New Project
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new project
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
					<FormField label="Project Title" htmlFor="title_new">
						<input
							id="title_new"
							type="text"
							value={formValues.title ?? ""}
							onChange={(e) =>
								handleFieldChange("title", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.title}
							placeholder="e.g., E-commerce Website"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
							placeholder="Describe your project, its features, and technologies used"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Project Link and Mentor Name */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Project Link" htmlFor="project_link_new">
							<input
								id="project_link_new"
								type="url"
								value={formValues.project_link ?? ""}
								onChange={(e) =>
									handleFieldChange("project_link", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.project_link}
								placeholder="https://github.com/username/project"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Mentor Name" htmlFor="mentor_name_new">
							<input
								id="mentor_name_new"
								type="text"
								value={formValues.mentor_name ?? ""}
								onChange={(e) =>
									handleFieldChange("mentor_name", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.mentor_name}
								placeholder="Enter mentor's name (optional)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Skills */}
					<FormField label="Skills & Technologies">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Project Images */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Project Screenshots (Optional)
						</h5>

						<FormField label="Upload Images" htmlFor="snaps_new">
							<input
								id="snaps_new"
								type="file"
								multiple
								onChange={(e) => handleImagesChange(e.target.files)}
								disabled={!FIELD_PERMISSIONS.snaps}
								accept="image/jpeg,image/png,image/jpg,image/webp"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB per image. Formats: JPG, PNG, WebP
							</p>
						</FormField>

						{previewUrls.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 mb-2">
									Selected images ({previewUrls.length}):
								</p>
								<ImagePreview
									images={previewUrls}
									onRemove={removeImage}
									disabled={!FIELD_PERMISSIONS.snaps}
								/>
							</div>
						)}
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
							Create Project
						</button>
						<button
							type="button"
							onClick={() => {
								previewUrls.forEach((url) => URL.revokeObjectURL(url));
								setFormValues(initialFormValues);
								setPreviewUrls([]);
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

// ==================== SINGLE PROJECT FORM ====================
interface ProjectFormProps {
	record: ProjectItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function ProjectForm({ record, onSuccess, onError }: ProjectFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	// Update mutation - using FormData
	const updateMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			// Append all fields to FormData
			if (values.title !== null) formData.append("title", values.title);
			if (values.description !== null)
				formData.append("description", values.description);
			if (values.project_link !== null)
				formData.append("project_link", values.project_link);
			if (values.mentor_name !== null)
				formData.append("mentor_name", values.mentor_name);

			// Handle skills array
			if (values.skills.length > 0) {
				formData.append("skills", values.skills.join(","));
			}

			// Handle replace_snaps flag
			formData.append("replace_snaps", values.replace_snaps.toString());

			// Handle image files
			if (values.snaps.length > 0) {
				values.snaps.forEach((file) => {
					formData.append("snaps", file);
				});
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.patch(`/projects/${record.id}`, formData, {
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
				queryKey: ["projects", record.user_id]
			});
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
			setPreviewUrls([]);
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<FormValues>({
		description: record.description,
		mentor_name: record.mentor_name,
		project_link: record.project_link,
		replace_snaps: false,
		skills: record.skills || [],
		snaps: [],
		title: record.title
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			description: record.description,
			mentor_name: record.mentor_name,
			project_link: record.project_link,
			replace_snaps: false,
			skills: record.skills || [],
			snaps: [],
			title: record.title
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

	const handleImagesChange = (files: FileList | null) => {
		if (!files) return;

		const newFiles = Array.from(files);
		handleFieldChange("snaps", [...formValues.snaps, ...newFiles]);

		// Create preview URLs
		const newUrls = newFiles.map((file) => URL.createObjectURL(file));
		setPreviewUrls((prev) => [...prev, ...newUrls]);
	};

	const removeNewImage = (index: number) => {
		// Revoke object URL to prevent memory leaks
		URL.revokeObjectURL(previewUrls[index]);

		setFormValues((prev) => ({
			...prev,
			snaps: prev.snaps.filter((_, i) => i !== index)
		}));
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
	};

	// Cleanup preview URLs on unmount
	useEffect(() => {
		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

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
							{record.title || "Untitled Project"}
						</h4>
						{record.description && (
							<p className="text-sm text-gray-600 mt-1 line-clamp-2">
								{record.description}
							</p>
						)}
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

					{/* Title */}
					<FormField label="Project Title" htmlFor={`title_${record.id}`}>
						<input
							id={`title_${record.id}`}
							type="text"
							value={formValues.title ?? ""}
							onChange={(e) =>
								handleFieldChange("title", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.title}
							placeholder="e.g., E-commerce Website"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
							placeholder="Describe your project, its features, and technologies used"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Project Link and Mentor Name */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Project Link"
							htmlFor={`project_link_${record.id}`}
						>
							<input
								id={`project_link_${record.id}`}
								type="url"
								value={formValues.project_link ?? ""}
								onChange={(e) =>
									handleFieldChange("project_link", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.project_link}
								placeholder="https://github.com/username/project"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Mentor Name" htmlFor={`mentor_name_${record.id}`}>
							<input
								id={`mentor_name_${record.id}`}
								type="text"
								value={formValues.mentor_name ?? ""}
								onChange={(e) =>
									handleFieldChange("mentor_name", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.mentor_name}
								placeholder="Enter mentor's name (optional)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Skills */}
					<FormField label="Skills & Technologies">
						<SkillsInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
						/>
					</FormField>

					{/* Project Images */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Project Screenshots
						</h5>

						{/* Existing images */}
						{record.snaps_signed_urls &&
							record.snaps_signed_urls.length > 0 && (
								<div className="mb-4">
									<p className="text-sm text-gray-700 mb-2">Current images:</p>
									<ImagePreview images={record.snaps_signed_urls} />
								</div>
							)}

						{/* Replace snaps toggle */}
						<div className="mb-4 flex items-center space-x-2">
							<input
								type="checkbox"
								id={`replace_snaps_${record.id}`}
								checked={formValues.replace_snaps}
								onChange={(e) =>
									handleFieldChange("replace_snaps", e.target.checked)
								}
								disabled={!FIELD_PERMISSIONS.replace_snaps}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
							/>
							<label
								htmlFor={`replace_snaps_${record.id}`}
								className="text-sm font-medium text-gray-700 cursor-pointer"
							>
								Replace existing images (instead of adding to them)
							</label>
						</div>

						<FormField
							label={
								formValues.replace_snaps
									? "Upload New Images (Replace All)"
									: "Upload Additional Images"
							}
							htmlFor={`snaps_${record.id}`}
						>
							<input
								id={`snaps_${record.id}`}
								type="file"
								multiple
								onChange={(e) => handleImagesChange(e.target.files)}
								disabled={!FIELD_PERMISSIONS.snaps}
								accept="image/jpeg,image/png,image/jpg,image/webp"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB per image. Formats: JPG, PNG, WebP
							</p>
						</FormField>

						{previewUrls.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 mb-2">
									New images to upload ({previewUrls.length}):
								</p>
								<ImagePreview
									images={previewUrls}
									onRemove={removeNewImage}
									disabled={!FIELD_PERMISSIONS.snaps}
								/>
							</div>
						)}
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
								previewUrls.forEach((url) => URL.revokeObjectURL(url));
								setFormValues({
									description: record.description,
									mentor_name: record.mentor_name,
									project_link: record.project_link,
									replace_snaps: false,
									skills: record.skills || [],
									snaps: [],
									title: record.title
								});
								setPreviewUrls([]);
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
interface ProjectsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function ProjectsForm({
	userId,
	onSuccess,
	onError
}: ProjectsFormProps) {
	// Fetch projects
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetProjectsResponse>(
				`/projects/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["projects", userId]
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
				Error loading projects: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>

			{/* Add New Project Form */}
			<AddProjectForm userId={userId} onSuccess={onSuccess} onError={onError} />

			{/* Existing Project Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<ProjectForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No projects found. Add your first project above.
				</div>
			)}
		</div>
	);
}
