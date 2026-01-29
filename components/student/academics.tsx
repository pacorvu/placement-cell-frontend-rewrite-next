import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const academicsItemSchema = z.object({
	academic_year: z.number().int(),
	closed_backlogs: z.number().int(),
	id: z.number().int(),
	live_backlogs: z.number().int(),
	provisional_result_upload_link: z.string(),
	provisional_result_upload_link_signed_url: z.string(),
	result_in_sgpa: z.number(),
	semester: z.number().int(),
	uploaded_at: z.string().datetime(),
	user_id: z.number().int(),
	usn: z.string()
});

const getAcademicsResponseSchema = z.array(academicsItemSchema);

const createAcademicsRequestSchema = z.object({
	academic_year: z.number().int(),
	closed_backlogs: z.number().int().nullable(),
	live_backlogs: z.number().int().nullable(),
	provisional_result_upload_link: z.string().nullable(),
	result_in_sgpa: z.number(),
	semester: z.number().int(),
	user_id: z.number().int()
});

const updateAcademicsRequestSchema = z.object({
	academic_year: z.number().int().nullable(),
	closed_backlogs: z.number().int().nullable(),
	live_backlogs: z.number().int().nullable(),
	provisional_result_upload_link: z.string().nullable(),
	result_in_sgpa: z.number().nullable(),
	semester: z.number().int().nullable()
});

type AcademicsItem = z.infer<typeof academicsItemSchema>;
type GetAcademicsResponse = z.infer<typeof getAcademicsResponseSchema>;
type CreateAcademicsRequest = z.infer<typeof createAcademicsRequestSchema>;
type UpdateAcademicsRequest = z.infer<typeof updateAcademicsRequestSchema>;

// Form values type for create
type CreateFormValues = {
	academic_year: number;
	semester: number;
	result_in_sgpa: number;
	closed_backlogs: number | null;
	live_backlogs: number | null;
	provisional_result_upload_link: File | null;
};

// Form values type for update
type UpdateFormValues = {
	academic_year: number | null;
	semester: number | null;
	result_in_sgpa: number | null;
	closed_backlogs: number | null;
	live_backlogs: number | null;
	provisional_result_upload_link: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	academic_year: true,
	closed_backlogs: true,
	live_backlogs: true,
	provisional_result_upload_link: true,
	result_in_sgpa: true,
	semester: true
} as const;

// ==================== HELPER COMPONENTS ====================
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

// ==================== ADD NEW ACADEMICS RECORD FORM ====================
interface AddAcademicsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddAcademicsForm({
	userId,
	onSuccess,
	onError
}: AddAcademicsFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: CreateFormValues = {
		academic_year: new Date().getFullYear(),
		closed_backlogs: null,
		live_backlogs: null,
		provisional_result_upload_link: null,
		result_in_sgpa: 0,
		semester: 1
	};

	const [formValues, setFormValues] =
		useState<CreateFormValues>(initialFormValues);
	const [errors, setErrors] = useState<
		Partial<Record<keyof CreateFormValues, string>>
	>({});

	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: CreateFormValues) => {
			console.log("=== CREATING NEW SEMESTER ACADEMICS ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			formData.append("user_id", userId.toString());
			formData.append("academic_year", values.academic_year.toString());
			formData.append("semester", values.semester.toString());
			formData.append("result_in_sgpa", values.result_in_sgpa.toString());

			if (values.closed_backlogs !== null) {
				formData.append("closed_backlogs", values.closed_backlogs.toString());
			}
			if (values.live_backlogs !== null) {
				formData.append("live_backlogs", values.live_backlogs.toString());
			}

			// Handle file separately
			if (values.provisional_result_upload_link) {
				formData.append(
					"provisional_result_upload_link",
					values.provisional_result_upload_link
				);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.post(`/semester-academics/user`, formData, {
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
				queryKey: ["semester-academics", userId]
			});
			setFormValues(initialFormValues);
			setErrors({});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof CreateFormValues, string>> = {};

		if (formValues.academic_year < 2000 || formValues.academic_year > 2100) {
			newErrors.academic_year = "Academic year must be between 2000 and 2100";
		}
		if (formValues.semester < 1 || formValues.semester > 8) {
			newErrors.semester = "Semester must be between 1 and 8";
		}
		if (formValues.result_in_sgpa < 0 || formValues.result_in_sgpa > 10) {
			newErrors.result_in_sgpa = "SGPA must be between 0 and 10";
		}
		if (
			formValues.closed_backlogs !== null &&
			(formValues.closed_backlogs < 0 || formValues.closed_backlogs > 50)
		) {
			newErrors.closed_backlogs = "Closed backlogs must be between 0 and 50";
		}
		if (
			formValues.live_backlogs !== null &&
			(formValues.live_backlogs < 0 || formValues.live_backlogs > 50)
		) {
			newErrors.live_backlogs = "Live backlogs must be between 0 and 50";
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
						Add Semester Academics
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new semester academic record
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
					{/* Academic Year and Semester */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Academic Year"
							htmlFor="academic_year_new"
							required
							error={errors.academic_year}
						>
							<input
								id="academic_year_new"
								type="number"
								value={formValues.academic_year}
								onChange={(e) =>
									handleFieldChange(
										"academic_year",
										parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.academic_year}
								placeholder="e.g., 2024"
								min="2000"
								max="2100"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Semester"
							htmlFor="semester_new"
							required
							error={errors.semester}
						>
							<select
								id="semester_new"
								value={formValues.semester}
								onChange={(e) =>
									handleFieldChange("semester", parseInt(e.target.value, 10))
								}
								disabled={!FIELD_PERMISSIONS.semester}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value={1}>Semester 1</option>
								<option value={2}>Semester 2</option>
								<option value={3}>Semester 3</option>
								<option value={4}>Semester 4</option>
								<option value={5}>Semester 5</option>
								<option value={6}>Semester 6</option>
								<option value={7}>Semester 7</option>
								<option value={8}>Semester 8</option>
							</select>
						</FormField>
					</div>

					{/* SGPA */}
					<FormField
						label="Result in SGPA"
						htmlFor="result_in_sgpa_new"
						required
						error={errors.result_in_sgpa}
					>
						<input
							id="result_in_sgpa_new"
							type="number"
							step="0.01"
							value={formValues.result_in_sgpa}
							onChange={(e) =>
								handleFieldChange("result_in_sgpa", parseFloat(e.target.value))
							}
							disabled={!FIELD_PERMISSIONS.result_in_sgpa}
							placeholder="e.g., 8.5"
							min="0"
							max="10"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Backlogs */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Closed Backlogs"
							htmlFor="closed_backlogs_new"
							error={errors.closed_backlogs}
						>
							<input
								id="closed_backlogs_new"
								type="number"
								value={formValues.closed_backlogs ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"closed_backlogs",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.closed_backlogs}
								placeholder="Enter number of closed backlogs"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Live Backlogs"
							htmlFor="live_backlogs_new"
							error={errors.live_backlogs}
						>
							<input
								id="live_backlogs_new"
								type="number"
								value={formValues.live_backlogs ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"live_backlogs",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.live_backlogs}
								placeholder="Enter number of live backlogs"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Provisional Result Upload */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Provisional Result Document
						</h5>

						<FormField
							label="Upload Provisional Result"
							htmlFor="provisional_result_new"
						>
							<input
								id="provisional_result_new"
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("provisional_result_upload_link", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.provisional_result_upload_link}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB. Formats: PDF, JPG, PNG
							</p>
							{formValues.provisional_result_upload_link && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.provisional_result_upload_link.name}
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
							Add Academic Record
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

// ==================== SINGLE ACADEMICS RECORD FORM ====================
interface AcademicsRecordFormProps {
	record: AcademicsItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AcademicsRecordForm({
	record,
	onSuccess,
	onError
}: AcademicsRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Update mutation - using FormData
	const updateMutation = useMutation({
		mutationFn: async (values: UpdateFormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			if (values.academic_year !== null)
				formData.append("academic_year", values.academic_year.toString());
			if (values.semester !== null)
				formData.append("semester", values.semester.toString());
			if (values.result_in_sgpa !== null)
				formData.append("result_in_sgpa", values.result_in_sgpa.toString());
			if (values.closed_backlogs !== null)
				formData.append("closed_backlogs", values.closed_backlogs.toString());
			if (values.live_backlogs !== null)
				formData.append("live_backlogs", values.live_backlogs.toString());

			// Handle file separately
			if (values.provisional_result_upload_link) {
				formData.append(
					"provisional_result_upload_link",
					values.provisional_result_upload_link
				);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.patch(
				`/semester-academics/${record.id}`,
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
				queryKey: ["semester-academics", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<UpdateFormValues>({
		academic_year: record.academic_year,
		closed_backlogs: record.closed_backlogs,
		live_backlogs: record.live_backlogs,
		provisional_result_upload_link: null,
		result_in_sgpa: record.result_in_sgpa,
		semester: record.semester
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			academic_year: record.academic_year,
			closed_backlogs: record.closed_backlogs,
			live_backlogs: record.live_backlogs,
			provisional_result_upload_link: null,
			result_in_sgpa: record.result_in_sgpa,
			semester: record.semester
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
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h4 className="font-semibold text-lg text-gray-900">
							Academic Year {record.academic_year} - Semester {record.semester}
						</h4>
						<p className="text-sm text-gray-600 mt-1">
							SGPA: {record.result_in_sgpa} •{" "}
							{record.live_backlogs > 0
								? `${record.live_backlogs} Live Backlog${record.live_backlogs > 1 ? "s" : ""}`
								: "No Backlogs"}
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

					{/* Academic Year and Semester */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Academic Year"
							htmlFor={`academic_year_${record.id}`}
						>
							<input
								id={`academic_year_${record.id}`}
								type="number"
								value={formValues.academic_year ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"academic_year",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.academic_year}
								placeholder="e.g., 2024"
								min="2000"
								max="2100"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Semester" htmlFor={`semester_${record.id}`}>
							<select
								id={`semester_${record.id}`}
								value={formValues.semester ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"semester",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.semester}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value="">Select semester</option>
								<option value={1}>Semester 1</option>
								<option value={2}>Semester 2</option>
								<option value={3}>Semester 3</option>
								<option value={4}>Semester 4</option>
								<option value={5}>Semester 5</option>
								<option value={6}>Semester 6</option>
								<option value={7}>Semester 7</option>
								<option value={8}>Semester 8</option>
							</select>
						</FormField>
					</div>

					{/* SGPA */}
					<FormField
						label="Result in SGPA"
						htmlFor={`result_in_sgpa_${record.id}`}
					>
						<input
							id={`result_in_sgpa_${record.id}`}
							type="number"
							step="0.01"
							value={formValues.result_in_sgpa ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"result_in_sgpa",
									e.target.value === "" ? null : parseFloat(e.target.value)
								)
							}
							disabled={!FIELD_PERMISSIONS.result_in_sgpa}
							placeholder="e.g., 8.5"
							min="0"
							max="10"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Backlogs */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Closed Backlogs"
							htmlFor={`closed_backlogs_${record.id}`}
						>
							<input
								id={`closed_backlogs_${record.id}`}
								type="number"
								value={formValues.closed_backlogs ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"closed_backlogs",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.closed_backlogs}
								placeholder="Enter number of closed backlogs"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Live Backlogs"
							htmlFor={`live_backlogs_${record.id}`}
						>
							<input
								id={`live_backlogs_${record.id}`}
								type="number"
								value={formValues.live_backlogs ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"live_backlogs",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.live_backlogs}
								placeholder="Enter number of live backlogs"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Provisional Result Upload */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Provisional Result Document
						</h5>

						{record.provisional_result_upload_link_signed_url && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800 mb-2">
									Current provisional result uploaded
								</p>
								<a
									href={record.provisional_result_upload_link_signed_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									View Document
								</a>
							</div>
						)}

						<FormField
							label="Upload New Provisional Result"
							htmlFor={`provisional_result_${record.id}`}
						>
							<input
								id={`provisional_result_${record.id}`}
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("provisional_result_upload_link", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.provisional_result_upload_link}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							{formValues.provisional_result_upload_link && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.provisional_result_upload_link.name}
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
									academic_year: record.academic_year,
									closed_backlogs: record.closed_backlogs,
									live_backlogs: record.live_backlogs,
									provisional_result_upload_link: null,
									result_in_sgpa: record.result_in_sgpa,
									semester: record.semester
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
interface SemesterAcademicsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function SemesterAcademicsForm({
	userId,
	onSuccess,
	onError
}: SemesterAcademicsFormProps) {
	// Fetch semester academics
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetAcademicsResponse>(
				`/semester-academics/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["semester-academics", userId]
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
				Error loading semester academics: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Semester Academics
			</h2>

			{/* Add New Academic Record Form */}
			<AddAcademicsForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Academic Records */}
			{data && data.length > 0 ? (
				data
					.sort((a, b) => {
						// Sort by academic year, then by semester
						if (a.academic_year !== b.academic_year) {
							return b.academic_year - a.academic_year;
						}
						return b.semester - a.semester;
					})
					.map((record) => (
						<AcademicsRecordForm
							key={record.id}
							record={record}
							onSuccess={onSuccess}
							onError={onError}
						/>
					))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No semester academic records found. Add your first record above.
				</div>
			)}
		</div>
	);
}
