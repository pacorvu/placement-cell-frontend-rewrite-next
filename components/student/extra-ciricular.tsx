import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const extracurricularItemSchema = z.object({
	achievements: z.array(z.string()),
	activity_name: z.string(),
	activity_type: z.string(),
	created_at: z.string().datetime(),
	description: z.string(),
	end_date: z.string(),
	id: z.number().int(),
	organization: z.string(),
	proof_document: z.string(),
	proof_document_signed_url: z.string(),
	role: z.string(),
	skills: z.array(z.string()),
	start_date: z.string(),
	updated_at: z.string().datetime(),
	user_id: z.number().int(),
	usn: z.string()
});

const getExtracurricularResponseSchema = z.array(extracurricularItemSchema);

const createExtracurricularRequestSchema = z.object({
	achievements: z.array(z.string()).nullable(),
	activity_name: z.string(),
	activity_type: z.string().nullable(),
	description: z.string().nullable(),
	end_date: z.string().nullable(),
	organization: z.string().nullable(),
	proof_document: z.string().nullable(),
	role: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	start_date: z.string().nullable(),
	user_id: z.number().int()
});

const updateExtracurricularRequestSchema = z.object({
	achievements: z.array(z.string()).nullable(),
	activity_name: z.string().nullable(),
	activity_type: z.string().nullable(),
	description: z.string().nullable(),
	end_date: z.string().nullable(),
	organization: z.string().nullable(),
	proof_document: z.string().nullable(),
	role: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	start_date: z.string().nullable()
});

type ExtracurricularItem = z.infer<typeof extracurricularItemSchema>;
type GetExtracurricularResponse = z.infer<
	typeof getExtracurricularResponseSchema
>;
type CreateExtracurricularRequest = z.infer<
	typeof createExtracurricularRequestSchema
>;
type UpdateExtracurricularRequest = z.infer<
	typeof updateExtracurricularRequestSchema
>;

// Form values type for create
type CreateFormValues = {
	activity_name: string;
	activity_type: string | null;
	role: string | null;
	organization: string | null;
	start_date: string | null;
	end_date: string | null;
	achievements: string[];
	skills: string[];
	description: string | null;
	proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
	activity_name: string | null;
	activity_type: string | null;
	role: string | null;
	organization: string | null;
	start_date: string | null;
	end_date: string | null;
	achievements: string[];
	skills: string[];
	description: string | null;
	proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	achievements: true,
	activity_name: true,
	activity_type: true,
	description: true,
	end_date: true,
	organization: true,
	proof_document: true,
	role: true,
	skills: true,
	start_date: true
} as const;

// ==================== HELPER COMPONENTS ====================
interface ArrayInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	disabled: boolean;
	placeholder: string;
	label?: string;
}

function ArrayInput({
	value,
	onChange,
	disabled,
	placeholder,
	label
}: ArrayInputProps) {
	const [input, setInput] = useState("");

	const addItem = () => {
		if (input.trim() && !value.includes(input.trim())) {
			onChange([...value, input.trim()]);
			setInput("");
		}
	};

	const removeItem = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div>
			<div className="flex gap-2 mb-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addItem();
						}
					}}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				<button
					type="button"
					onClick={addItem}
					disabled={disabled || !input.trim()}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					Add
				</button>
			</div>
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((item, index) => (
						<div
							key={index}
							className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
						>
							<span className="text-sm">{item}</span>
							<button
								type="button"
								onClick={() => removeItem(index)}
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

// ==================== ADD NEW ACTIVITY FORM ====================
interface AddExtracurricularFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddExtracurricularForm({
	userId,
	onSuccess,
	onError
}: AddExtracurricularFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: CreateFormValues = {
		achievements: [],
		activity_name: "",
		activity_type: null,
		description: null,
		end_date: null,
		organization: null,
		proof_document: null,
		role: null,
		skills: [],
		start_date: null
	};

	const [formValues, setFormValues] =
		useState<CreateFormValues>(initialFormValues);
	const [errors, setErrors] = useState<
		Partial<Record<keyof CreateFormValues, string>>
	>({});

	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: CreateFormValues) => {
			console.log("=== CREATING NEW EXTRACURRICULAR ACTIVITY ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			formData.append("user_id", userId.toString());
			formData.append("activity_name", values.activity_name);

			if (values.activity_type !== null)
				formData.append("activity_type", values.activity_type);
			if (values.role !== null) formData.append("role", values.role);
			if (values.organization !== null)
				formData.append("organization", values.organization);
			if (values.start_date !== null)
				formData.append("start_date", values.start_date);
			if (values.end_date !== null)
				formData.append("end_date", values.end_date);
			if (values.description !== null)
				formData.append("description", values.description);

			// Handle achievements array
			if (values.achievements.length > 0) {
				formData.append("achievements", values.achievements.join(","));
			}

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

			const response = await api.post(
				`/extra-curricular-activities/user`,
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
			console.error("Create error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["extra-curricular-activities", userId]
			});
			setFormValues(initialFormValues);
			setErrors({});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof CreateFormValues, string>> = {};

		if (!formValues.activity_name.trim()) {
			newErrors.activity_name = "Activity name is required";
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
						Add Extra-Curricular Activity
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new extra-curricular activity
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
					{/* Activity Name */}
					<FormField
						label="Activity Name"
						htmlFor="activity_name_new"
						required
						error={errors.activity_name}
					>
						<input
							id="activity_name_new"
							type="text"
							value={formValues.activity_name}
							onChange={(e) =>
								handleFieldChange("activity_name", e.target.value)
							}
							disabled={!FIELD_PERMISSIONS.activity_name}
							placeholder="e.g., Debate Club, Sports Team, Student Council"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Activity Type and Role */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Activity Type" htmlFor="activity_type_new">
							<input
								id="activity_type_new"
								type="text"
								value={formValues.activity_type ?? ""}
								onChange={(e) =>
									handleFieldChange("activity_type", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.activity_type}
								placeholder="e.g., Club, Sports, Volunteer, Cultural"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Role" htmlFor="role_new">
							<input
								id="role_new"
								type="text"
								value={formValues.role ?? ""}
								onChange={(e) =>
									handleFieldChange("role", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.role}
								placeholder="e.g., President, Member, Captain"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Organization */}
					<FormField label="Organization" htmlFor="organization_new">
						<input
							id="organization_new"
							type="text"
							value={formValues.organization ?? ""}
							onChange={(e) =>
								handleFieldChange("organization", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.organization}
							placeholder="e.g., University Club, NGO Name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Start Date and End Date */}
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

					{/* Achievements */}
					<FormField label="Achievements">
						<ArrayInput
							value={formValues.achievements}
							onChange={(achievements) =>
								handleFieldChange("achievements", achievements)
							}
							disabled={!FIELD_PERMISSIONS.achievements}
							placeholder="Add an achievement (e.g., Won first prize)"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills Developed">
						<ArrayInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
							placeholder="Add a skill (e.g., Leadership, Teamwork)"
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
							placeholder="Describe your role, responsibilities, and contributions"
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
							label="Upload Certificate/Proof"
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
							Add Activity
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

// ==================== SINGLE ACTIVITY RECORD FORM ====================
interface ExtracurricularRecordFormProps {
	record: ExtracurricularItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function ExtracurricularRecordForm({
	record,
	onSuccess,
	onError
}: ExtracurricularRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Update mutation - using FormData
	const updateMutation = useMutation({
		mutationFn: async (values: UpdateFormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			if (values.activity_name !== null)
				formData.append("activity_name", values.activity_name);
			if (values.activity_type !== null)
				formData.append("activity_type", values.activity_type);
			if (values.role !== null) formData.append("role", values.role);
			if (values.organization !== null)
				formData.append("organization", values.organization);
			if (values.start_date !== null)
				formData.append("start_date", values.start_date);
			if (values.end_date !== null)
				formData.append("end_date", values.end_date);
			if (values.description !== null)
				formData.append("description", values.description);

			// Handle achievements array
			if (values.achievements.length > 0) {
				formData.append("achievements", values.achievements.join(","));
			}

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
				`/extra-curricular-activities/${record.id}`,
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
				queryKey: ["extra-curricular-activities", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<UpdateFormValues>({
		achievements: record.achievements || [],
		activity_name: record.activity_name,
		activity_type: record.activity_type,
		description: record.description,
		end_date: record.end_date,
		organization: record.organization,
		proof_document: null,
		role: record.role,
		skills: record.skills || [],
		start_date: record.start_date
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			achievements: record.achievements || [],
			activity_name: record.activity_name,
			activity_type: record.activity_type,
			description: record.description,
			end_date: record.end_date,
			organization: record.organization,
			proof_document: null,
			role: record.role,
			skills: record.skills || [],
			start_date: record.start_date
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
							{record.activity_name}
						</h4>
						<p className="text-sm text-gray-600 mt-1">
							{record.role && `${record.role} • `}
							{record.organization || "No organization"}
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

				{/* Display achievements in header */}
				{record.achievements && record.achievements.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{record.achievements.slice(0, 3).map((achievement, idx) => (
							<span
								key={idx}
								className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
							>
								🏆 {achievement}
							</span>
						))}
						{record.achievements.length > 3 && (
							<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
								+{record.achievements.length - 3} more
							</span>
						)}
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

					{/* Activity Name */}
					<FormField
						label="Activity Name"
						htmlFor={`activity_name_${record.id}`}
					>
						<input
							id={`activity_name_${record.id}`}
							type="text"
							value={formValues.activity_name ?? ""}
							onChange={(e) =>
								handleFieldChange("activity_name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.activity_name}
							placeholder="e.g., Debate Club, Sports Team, Student Council"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Activity Type and Role */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Activity Type"
							htmlFor={`activity_type_${record.id}`}
						>
							<input
								id={`activity_type_${record.id}`}
								type="text"
								value={formValues.activity_type ?? ""}
								onChange={(e) =>
									handleFieldChange("activity_type", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.activity_type}
								placeholder="e.g., Club, Sports, Volunteer, Cultural"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Role" htmlFor={`role_${record.id}`}>
							<input
								id={`role_${record.id}`}
								type="text"
								value={formValues.role ?? ""}
								onChange={(e) =>
									handleFieldChange("role", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.role}
								placeholder="e.g., President, Member, Captain"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Organization */}
					<FormField label="Organization" htmlFor={`organization_${record.id}`}>
						<input
							id={`organization_${record.id}`}
							type="text"
							value={formValues.organization ?? ""}
							onChange={(e) =>
								handleFieldChange("organization", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.organization}
							placeholder="e.g., University Club, NGO Name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Start Date and End Date */}
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

					{/* Achievements */}
					<FormField label="Achievements">
						<ArrayInput
							value={formValues.achievements}
							onChange={(achievements) =>
								handleFieldChange("achievements", achievements)
							}
							disabled={!FIELD_PERMISSIONS.achievements}
							placeholder="Add an achievement (e.g., Won first prize)"
						/>
					</FormField>

					{/* Skills */}
					<FormField label="Skills Developed">
						<ArrayInput
							value={formValues.skills}
							onChange={(skills) => handleFieldChange("skills", skills)}
							disabled={!FIELD_PERMISSIONS.skills}
							placeholder="Add a skill (e.g., Leadership, Teamwork)"
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
							placeholder="Describe your role, responsibilities, and contributions"
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
									Current certificate uploaded
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
							label="Upload New Certificate/Proof"
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
									achievements: record.achievements || [],
									activity_name: record.activity_name,
									activity_type: record.activity_type,
									description: record.description,
									end_date: record.end_date,
									organization: record.organization,
									proof_document: null,
									role: record.role,
									skills: record.skills || [],
									start_date: record.start_date
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
interface ExtracurricularFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function ExtracurricularForm({
	userId,
	onSuccess,
	onError
}: ExtracurricularFormProps) {
	// Fetch extra-curricular activities
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetExtracurricularResponse>(
				`/extra-curricular-activities/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["extra-curricular-activities", userId]
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
				Error loading extra-curricular activities: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Extra-Curricular Activities
			</h2>

			{/* Add New Activity Form */}
			<AddExtracurricularForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Activity Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<ExtracurricularRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No extra-curricular activities found. Add your first activity above.
				</div>
			)}
		</div>
	);
}
