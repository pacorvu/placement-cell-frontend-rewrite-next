import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const educationalHistoryItemSchema = z.object({
	board: z.string().nullable(),
	city: z.string().nullable(),
	created_at: z.string().datetime(),
	education_level: z
		.enum(["10TH", "12TH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "OTHER"])
		.nullable(),
	gap_duration_months: z.number().nullable(),
	gap_reason: z.string().nullable(),
	gap_type: z
		.enum([
			"12TH_TO_GRADUATION",
			"DIPLOMA_TO_GRADUATION",
			"GRADUATION_TO_POST_GRADUATION"
		])
		.nullable(),
	id: z.number(),
	institute_name: z.string().nullable(),
	marksheet_file: z.string().nullable(),
	marksheet_file_signed_url: z.string().nullable(),
	result: z.number().nullable(),
	result_type: z.enum(["PERCENTAGE", "CGPA"]).nullable(),
	subjects: z.string().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string(),
	year_of_passing: z.number().nullable()
});

const getEducationalHistoryResponseSchema = z.array(
	educationalHistoryItemSchema
);

const createEducationHistoryRequestSchema = z.object({
	board: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	education_level: z
		.enum(["10TH", "12TH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "OTHER"])
		.nullable()
		.optional(),
	gap_duration_months: z.number().int().nullable().optional(),
	gap_reason: z.string().nullable().optional(),
	gap_type: z
		.enum([
			"12TH_TO_GRADUATION",
			"DIPLOMA_TO_GRADUATION",
			"GRADUATION_TO_POST_GRADUATION"
		])
		.nullable()
		.optional(),
	institute_name: z.string().nullable().optional(),
	marksheet_file: z
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
	result: z.number().nullable().optional(),
	result_type: z.enum(["PERCENTAGE", "CGPA"]).nullable().optional(),
	subjects: z.string().nullable().optional(),
	year_of_passing: z.number().int().nullable().optional()
});

const createEducationHistoryResponseSchema = z.object({
	board: z.string().nullable(),
	city: z.string().nullable(),
	created_at: z.string().datetime(),
	education_level: z
		.enum(["10TH", "12TH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "OTHER"])
		.nullable(),
	gap_duration_months: z.number().nullable(),
	gap_reason: z.string().nullable(),
	gap_type: z
		.enum([
			"12TH_TO_GRADUATION",
			"DIPLOMA_TO_GRADUATION",
			"GRADUATION_TO_POST_GRADUATION"
		])
		.nullable(),
	id: z.number(),
	institute_name: z.string().nullable(),
	marksheet_file: z.string().nullable(),
	marksheet_file_signed_url: z.string().nullable(),
	result: z.number().nullable(),
	result_type: z.enum(["PERCENTAGE", "CGPA"]).nullable(),
	subjects: z.string().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string(),
	year_of_passing: z.number().nullable()
});

type EducationalHistoryItem = z.infer<typeof educationalHistoryItemSchema>;
type GetEducationalHistoryResponse = z.infer<
	typeof getEducationalHistoryResponseSchema
>;
type CreateEducationHistoryRequest = z.infer<
	typeof createEducationHistoryRequestSchema
>;
type CreateEducationHistoryResponse = z.infer<
	typeof createEducationHistoryResponseSchema
>;

// Form values type (simplified)
type FormValues = {
	board: string | null;
	city: string | null;
	education_level: string | null;
	gap_duration_months: number | null;
	gap_reason: string | null;
	gap_type: string | null;
	institute_name: string | null;
	marksheet_file: File | null;
	result: number | null;
	result_type: string | null;
	subjects: string | null;
	year_of_passing: number | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	board: true,
	city: true,
	education_level: true,
	gap_duration_months: true,
	gap_reason: true,
	gap_type: true,
	institute_name: true,
	marksheet_file: true,
	result: true,
	result_type: true,
	subjects: true,
	year_of_passing: true
} as const;

// ==================== ADD NEW EDUCATION RECORD FORM ====================
interface AddEducationRecordFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddEducationRecordForm({
	userId,
	onSuccess,
	onError
}: AddEducationRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: FormValues = {
		board: null,
		city: null,
		education_level: null,
		gap_duration_months: null,
		gap_reason: null,
		gap_type: null,
		institute_name: null,
		marksheet_file: null,
		result: null,
		result_type: null,
		subjects: null,
		year_of_passing: null
	};

	const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

	// Create mutation - using FormData
	const createMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log("=== CREATING NEW RECORD ===");
			console.log("Values:", values);

			// Create FormData
			const formData = new FormData();

			// Append all fields to FormData
			if (values.board !== null) formData.append("board", values.board);
			if (values.city !== null) formData.append("city", values.city);
			if (values.education_level !== null)
				formData.append("education_level", values.education_level);
			if (values.gap_duration_months !== null)
				formData.append(
					"gap_duration_months",
					values.gap_duration_months.toString()
				);
			if (values.gap_reason !== null)
				formData.append("gap_reason", values.gap_reason);
			if (values.gap_type !== null)
				formData.append("gap_type", values.gap_type);
			if (values.institute_name !== null)
				formData.append("institute_name", values.institute_name);
			if (values.result !== null)
				formData.append("result", values.result.toString());
			if (values.result_type !== null)
				formData.append("result_type", values.result_type);
			if (values.subjects !== null)
				formData.append("subjects", values.subjects);
			if (values.year_of_passing !== null)
				formData.append("year_of_passing", values.year_of_passing.toString());
			formData.append("user_id", userId.toString());
			// Handle file separately
			if (values.marksheet_file) {
				formData.append("marksheet_file", values.marksheet_file);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.post(`/education-history/user`, formData, {
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
				queryKey: ["education-history", userId]
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
						Add New Educational Record
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add a new educational qualification
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
					{/* Education Level */}
					<div>
						<label
							htmlFor="education_level_new"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Education Level
						</label>
						<select
							id="education_level_new"
							value={formValues.education_level ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"education_level",
									e.target.value === "" ? null : e.target.value
								)
							}
							disabled={!FIELD_PERMISSIONS.education_level}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						>
							<option value="">Select level</option>
							<option value="10TH">10th</option>
							<option value="12TH">12th</option>
							<option value="DIPLOMA">Diploma</option>
							<option value="GRADUATION">Graduation</option>
							<option value="POST_GRADUATION">Post Graduation</option>
							<option value="OTHER">Other</option>
						</select>
					</div>

					{/* Institute Name */}
					<div>
						<label
							htmlFor="institute_name_new"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Institute Name
						</label>
						<input
							id="institute_name_new"
							type="text"
							value={formValues.institute_name ?? ""}
							onChange={(e) =>
								handleFieldChange("institute_name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.institute_name}
							placeholder="Enter institute name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* City and Board */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="city_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								City
							</label>
							<input
								id="city_new"
								type="text"
								value={formValues.city ?? ""}
								onChange={(e) =>
									handleFieldChange("city", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.city}
								placeholder="Enter city"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor="board_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Board/University
							</label>
							<input
								id="board_new"
								type="text"
								value={formValues.board ?? ""}
								onChange={(e) =>
									handleFieldChange("board", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.board}
								placeholder="Enter board/university"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>
					</div>

					{/* Year of Passing and Result */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
								htmlFor="year_of_passing_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Year of Passing
							</label>
							<input
								id="year_of_passing_new"
								type="number"
								value={formValues.year_of_passing ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"year_of_passing",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.year_of_passing}
								placeholder="2024"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor="result_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Result
							</label>
							<input
								id="result_new"
								type="number"
								step="0.01"
								value={formValues.result ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"result",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.result}
								placeholder="85.5"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor="result_type_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Result Type
							</label>
							<select
								id="result_type_new"
								value={formValues.result_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"result_type",
										e.target.value === "" ? null : e.target.value
									)
								}
								disabled={!FIELD_PERMISSIONS.result_type}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value="">Select type</option>
								<option value="PERCENTAGE">Percentage</option>
								<option value="CGPA">CGPA</option>
							</select>
						</div>
					</div>

					{/* Subjects */}
					<div>
						<label
							htmlFor="subjects_new"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Subjects
						</label>
						<textarea
							id="subjects_new"
							value={formValues.subjects ?? ""}
							onChange={(e) =>
								handleFieldChange("subjects", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.subjects}
							placeholder="Enter subjects (comma-separated)"
							rows={2}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Gap Information */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Gap Information (Optional)
						</h5>

						<div className="mb-4">
							<label
								htmlFor="gap_type_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Gap Type
							</label>
							<select
								id="gap_type_new"
								value={formValues.gap_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"gap_type",
										e.target.value === "" ? null : e.target.value
									)
								}
								disabled={!FIELD_PERMISSIONS.gap_type}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value="">No gap</option>
								<option value="12TH_TO_GRADUATION">12th to Graduation</option>
								<option value="DIPLOMA_TO_GRADUATION">
									Diploma to Graduation
								</option>
								<option value="GRADUATION_TO_POST_GRADUATION">
									Graduation to Post Graduation
								</option>
							</select>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="gap_duration_new"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Gap Duration (Months)
								</label>
								<input
									id="gap_duration_new"
									type="number"
									value={formValues.gap_duration_months ?? ""}
									onChange={(e) =>
										handleFieldChange(
											"gap_duration_months",
											e.target.value === ""
												? null
												: parseInt(e.target.value, 10)
										)
									}
									disabled={!FIELD_PERMISSIONS.gap_duration_months}
									placeholder="12"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
								/>
							</div>

							<div>
								<label
									htmlFor="gap_reason_new"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Gap Reason
								</label>
								<input
									id="gap_reason_new"
									type="text"
									value={formValues.gap_reason ?? ""}
									onChange={(e) =>
										handleFieldChange("gap_reason", e.target.value || null)
									}
									disabled={!FIELD_PERMISSIONS.gap_reason}
									placeholder="Enter reason for gap"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
								/>
							</div>
						</div>
					</div>

					{/* Marksheet */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">
							Marksheet (Optional)
						</h5>

						<div>
							<label
								htmlFor="marksheet_new"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Upload Marksheet
							</label>
							<input
								id="marksheet_new"
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("marksheet_file", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.marksheet_file}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 10MB. Formats: PDF, JPG, PNG
							</p>
							{formValues.marksheet_file && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.marksheet_file.name}
								</p>
							)}
						</div>
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
							Create Record
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

// ==================== SINGLE EDUCATION RECORD FORM ====================
interface EducationRecordFormProps {
	record: EducationalHistoryItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function EducationRecordForm({
	record,
	onSuccess,
	onError
}: EducationRecordFormProps) {
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
			if (values.board !== null) formData.append("board", values.board);
			if (values.city !== null) formData.append("city", values.city);
			if (values.education_level !== null)
				formData.append("education_level", values.education_level);
			if (values.gap_duration_months !== null)
				formData.append(
					"gap_duration_months",
					values.gap_duration_months.toString()
				);
			if (values.gap_reason !== null)
				formData.append("gap_reason", values.gap_reason);
			if (values.gap_type !== null)
				formData.append("gap_type", values.gap_type);
			if (values.institute_name !== null)
				formData.append("institute_name", values.institute_name);
			if (values.result !== null)
				formData.append("result", values.result.toString());
			if (values.result_type !== null)
				formData.append("result_type", values.result_type);
			if (values.subjects !== null)
				formData.append("subjects", values.subjects);
			if (values.year_of_passing !== null)
				formData.append("year_of_passing", values.year_of_passing.toString());

			// Handle file separately
			if (values.marksheet_file) {
				formData.append("marksheet_file", values.marksheet_file);
			}

			// Log FormData contents
			console.log("FormData contents:");
			for (const [key, value] of formData.entries()) {
				console.log(`  ${key}:`, value);
			}

			const response = await api.patch(
				`/education-history/${record.id}`,
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
				queryKey: ["education-history", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<FormValues>({
		board: record.board,
		city: record.city,
		education_level: record.education_level,
		gap_duration_months: record.gap_duration_months,
		gap_reason: record.gap_reason,
		gap_type: record.gap_type,
		institute_name: record.institute_name,
		marksheet_file: null,
		result: record.result,
		result_type: record.result_type,
		subjects: record.subjects,
		year_of_passing: record.year_of_passing
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			board: record.board,
			city: record.city,
			education_level: record.education_level,
			gap_duration_months: record.gap_duration_months,
			gap_reason: record.gap_reason,
			gap_type: record.gap_type,
			institute_name: record.institute_name,
			marksheet_file: null,
			result: record.result,
			result_type: record.result_type,
			subjects: record.subjects,
			year_of_passing: record.year_of_passing
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

	const educationLevelLabel =
		record.education_level?.replace(/_/g, " ") || "Not Set";

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			{/* Header */}
			<div
				className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex-1">
					<h4 className="font-semibold text-lg text-gray-900">
						{educationLevelLabel}
					</h4>
					<p className="text-sm text-gray-600 mt-1">
						{record.institute_name || "Institute not set"} •{" "}
						{record.year_of_passing || "Year not set"}
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

					{/* Education Level */}
					<div>
						<label
							htmlFor={`education_level_${record.id}`}
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Education Level
						</label>
						<select
							id={`education_level_${record.id}`}
							value={formValues.education_level ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"education_level",
									e.target.value === "" ? null : e.target.value
								)
							}
							disabled={!FIELD_PERMISSIONS.education_level}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						>
							<option value="">Select level</option>
							<option value="10TH">10th</option>
							<option value="12TH">12th</option>
							<option value="DIPLOMA">Diploma</option>
							<option value="GRADUATION">Graduation</option>
							<option value="POST_GRADUATION">Post Graduation</option>
							<option value="OTHER">Other</option>
						</select>
					</div>

					{/* Institute Name */}
					<div>
						<label
							htmlFor={`institute_name_${record.id}`}
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Institute Name
						</label>
						<input
							id={`institute_name_${record.id}`}
							type="text"
							value={formValues.institute_name ?? ""}
							onChange={(e) =>
								handleFieldChange("institute_name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.institute_name}
							placeholder="Enter institute name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* City and Board */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor={`city_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								City
							</label>
							<input
								id={`city_${record.id}`}
								type="text"
								value={formValues.city ?? ""}
								onChange={(e) =>
									handleFieldChange("city", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.city}
								placeholder="Enter city"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor={`board_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Board/University
							</label>
							<input
								id={`board_${record.id}`}
								type="text"
								value={formValues.board ?? ""}
								onChange={(e) =>
									handleFieldChange("board", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.board}
								placeholder="Enter board/university"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>
					</div>

					{/* Year of Passing and Result */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
								htmlFor={`year_of_passing_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Year of Passing
							</label>
							<input
								id={`year_of_passing_${record.id}`}
								type="number"
								value={formValues.year_of_passing ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"year_of_passing",
										e.target.value === "" ? null : parseInt(e.target.value, 10)
									)
								}
								disabled={!FIELD_PERMISSIONS.year_of_passing}
								placeholder="2024"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor={`result_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Result
							</label>
							<input
								id={`result_${record.id}`}
								type="number"
								step="0.01"
								value={formValues.result ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"result",
										e.target.value === "" ? null : parseFloat(e.target.value)
									)
								}
								disabled={!FIELD_PERMISSIONS.result}
								placeholder="85.5"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</div>

						<div>
							<label
								htmlFor={`result_type_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Result Type
							</label>
							<select
								id={`result_type_${record.id}`}
								value={formValues.result_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"result_type",
										e.target.value === "" ? null : e.target.value
									)
								}
								disabled={!FIELD_PERMISSIONS.result_type}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value="">Select type</option>
								<option value="PERCENTAGE">Percentage</option>
								<option value="CGPA">CGPA</option>
							</select>
						</div>
					</div>

					{/* Subjects */}
					<div>
						<label
							htmlFor={`subjects_${record.id}`}
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Subjects
						</label>
						<textarea
							id={`subjects_${record.id}`}
							value={formValues.subjects ?? ""}
							onChange={(e) =>
								handleFieldChange("subjects", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.subjects}
							placeholder="Enter subjects (comma-separated)"
							rows={2}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</div>

					{/* Gap Information */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">Gap Information</h5>

						<div className="mb-4">
							<label
								htmlFor={`gap_type_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Gap Type
							</label>
							<select
								id={`gap_type_${record.id}`}
								value={formValues.gap_type ?? ""}
								onChange={(e) =>
									handleFieldChange(
										"gap_type",
										e.target.value === "" ? null : e.target.value
									)
								}
								disabled={!FIELD_PERMISSIONS.gap_type}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							>
								<option value="">No gap</option>
								<option value="12TH_TO_GRADUATION">12th to Graduation</option>
								<option value="DIPLOMA_TO_GRADUATION">
									Diploma to Graduation
								</option>
								<option value="GRADUATION_TO_POST_GRADUATION">
									Graduation to Post Graduation
								</option>
							</select>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor={`gap_duration_${record.id}`}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Gap Duration (Months)
								</label>
								<input
									id={`gap_duration_${record.id}`}
									type="number"
									value={formValues.gap_duration_months ?? ""}
									onChange={(e) =>
										handleFieldChange(
											"gap_duration_months",
											e.target.value === ""
												? null
												: parseInt(e.target.value, 10)
										)
									}
									disabled={!FIELD_PERMISSIONS.gap_duration_months}
									placeholder="12"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
								/>
							</div>

							<div>
								<label
									htmlFor={`gap_reason_${record.id}`}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Gap Reason
								</label>
								<input
									id={`gap_reason_${record.id}`}
									type="text"
									value={formValues.gap_reason ?? ""}
									onChange={(e) =>
										handleFieldChange("gap_reason", e.target.value || null)
									}
									disabled={!FIELD_PERMISSIONS.gap_reason}
									placeholder="Enter reason for gap"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
								/>
							</div>
						</div>
					</div>

					{/* Marksheet */}
					<div className="pt-4 border-t border-gray-200">
						<h5 className="font-medium text-gray-900 mb-4">Marksheet</h5>

						{record.marksheet_file_signed_url && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-sm text-blue-800 mb-2">
									Current marksheet uploaded
								</p>
								<a
									href={record.marksheet_file_signed_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									View Marksheet
								</a>
							</div>
						)}

						<div>
							<label
								htmlFor={`marksheet_${record.id}`}
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Upload New Marksheet
							</label>
							<input
								id={`marksheet_${record.id}`}
								type="file"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleFieldChange("marksheet_file", file);
									}
								}}
								disabled={!FIELD_PERMISSIONS.marksheet_file}
								accept=".pdf,.jpg,.jpeg,.png"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
							{formValues.marksheet_file && (
								<p className="text-sm text-gray-600 mt-1">
									Selected: {formValues.marksheet_file.name}
								</p>
							)}
						</div>
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
									board: record.board,
									city: record.city,
									education_level: record.education_level,
									gap_duration_months: record.gap_duration_months,
									gap_reason: record.gap_reason,
									gap_type: record.gap_type,
									institute_name: record.institute_name,
									marksheet_file: null,
									result: record.result,
									result_type: record.result_type,
									subjects: record.subjects,
									year_of_passing: record.year_of_passing
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
interface EducationalHistoryFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function EducationalHistoryForm({
	userId,
	onSuccess,
	onError
}: EducationalHistoryFormProps) {
	// Fetch educational history
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetEducationalHistoryResponse>(
				`/education-history/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["education-history", userId]
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
				Error loading educational history: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Educational History
			</h2>

			{/* Add New Record Form */}
			<AddEducationRecordForm
				userId={userId}
				onSuccess={onSuccess}
				onError={onError}
			/>

			{/* Existing Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<EducationRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No educational history records found. Add your first record above.
				</div>
			)}
		</div>
	);
}
