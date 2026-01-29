import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const parentItemSchema = z.object({
	created_at: z.string().datetime(),
	email: z.string().email().nullable(),
	id: z.number(),
	name: z.string().nullable(),
	occupation: z.string().nullable(),
	organisation: z.string().nullable(),
	parent_type: z.string().nullable(),
	phone_number: z.string().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string()
});

const getParentDetailsResponseSchema = z.array(parentItemSchema);

const createParentRequestSchema = z.object({
	email: z.string().email(),
	name: z.string(),
	occupation: z.string(),
	organisation: z.string(),
	parent_type: z.string(),
	phone_number: z.string(),
	student_user_id: z.number()
});

const updateParentRequestSchema = z.object({
	email: z.string().email().nullable().optional(),
	name: z.string().nullable().optional(),
	occupation: z.string().nullable().optional(),
	organisation: z.string().nullable().optional(),
	parent_type: z.enum(["Father", "Mother", "Guardian"]).nullable().optional(),
	phone_number: z.string().nullable().optional()
});

type ParentItem = z.infer<typeof parentItemSchema>;
type GetParentDetailsResponse = z.infer<typeof getParentDetailsResponseSchema>;
type CreateParentRequest = z.infer<typeof createParentRequestSchema>;
type UpdateParentRequest = z.infer<typeof updateParentRequestSchema>;

// Form values type for create
type CreateFormValues = {
	parent_type: string;
	name: string;
	occupation: string;
	organisation: string;
	phone_number: string;
	email: string;
};

// Form values type for update
type UpdateFormValues = {
	parent_type: string | null;
	name: string | null;
	occupation: string | null;
	organisation: string | null;
	email: string | null;
	phone_number: string | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	email: true,
	name: true,
	occupation: true,
	organisation: true,
	parent_type: true,
	phone_number: true
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

// ==================== ADD NEW PARENT FORM ====================
interface AddParentFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function AddParentForm({ userId, onSuccess, onError }: AddParentFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Initial empty form values
	const initialFormValues: CreateFormValues = {
		email: "",
		name: "",
		occupation: "",
		organisation: "",
		parent_type: "",
		phone_number: ""
	};

	const [formValues, setFormValues] =
		useState<CreateFormValues>(initialFormValues);
	const [errors, setErrors] = useState<
		Partial<Record<keyof CreateFormValues, string>>
	>({});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: async (values: CreateFormValues) => {
			console.log("=== CREATING NEW PARENT/GUARDIAN ===");
			console.log("Values:", values);

			const payload = {
				...values,
				student_user_id: userId
			};

			const response = await api.post(`/parent-details/user`, payload);
			console.log("Response:", response.data);
			return response.data;
		},
		onError: (error: any) => {
			console.error("Create error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["parent-details", userId]
			});
			setFormValues(initialFormValues);
			setErrors({});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof CreateFormValues, string>> = {};

		if (!formValues.parent_type) {
			newErrors.parent_type = "Parent type is required";
		}
		if (!formValues.name.trim()) {
			newErrors.name = "Name is required";
		}
		if (!formValues.occupation.trim()) {
			newErrors.occupation = "Occupation is required";
		}
		if (!formValues.organisation.trim()) {
			newErrors.organisation = "Organisation is required";
		}
		if (!formValues.phone_number.trim()) {
			newErrors.phone_number = "Phone number is required";
		}
		if (!formValues.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
			newErrors.email = "Invalid email format";
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
						Add Parent/Guardian Details
					</h4>
					<p className="text-sm text-blue-700 mt-1">
						Click to add parent or guardian information
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
					{/* Parent Type */}
					<FormField
						label="Parent/Guardian Type"
						htmlFor="parent_type_new"
						required
						error={errors.parent_type}
					>
						<select
							id="parent_type_new"
							value={formValues.parent_type}
							onChange={(e) => handleFieldChange("parent_type", e.target.value)}
							disabled={!FIELD_PERMISSIONS.parent_type}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						>
							<option value="">Select type</option>
							<option value="Father">Father</option>
							<option value="Mother">Mother</option>
							<option value="Guardian">Guardian</option>
						</select>
					</FormField>

					{/* Name */}
					<FormField
						label="Full Name"
						htmlFor="name_new"
						required
						error={errors.name}
					>
						<input
							id="name_new"
							type="text"
							value={formValues.name}
							onChange={(e) => handleFieldChange("name", e.target.value)}
							disabled={!FIELD_PERMISSIONS.name}
							placeholder="Enter full name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Email and Phone */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Email"
							htmlFor="email_new"
							required
							error={errors.email}
						>
							<input
								id="email_new"
								type="email"
								value={formValues.email}
								onChange={(e) => handleFieldChange("email", e.target.value)}
								disabled={!FIELD_PERMISSIONS.email}
								placeholder="parent@example.com"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Phone Number"
							htmlFor="phone_number_new"
							required
							error={errors.phone_number}
						>
							<input
								id="phone_number_new"
								type="tel"
								value={formValues.phone_number}
								onChange={(e) =>
									handleFieldChange("phone_number", e.target.value)
								}
								disabled={!FIELD_PERMISSIONS.phone_number}
								placeholder="+91 9876543210"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Occupation and Organisation */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Occupation"
							htmlFor="occupation_new"
							required
							error={errors.occupation}
						>
							<input
								id="occupation_new"
								type="text"
								value={formValues.occupation}
								onChange={(e) =>
									handleFieldChange("occupation", e.target.value)
								}
								disabled={!FIELD_PERMISSIONS.occupation}
								placeholder="e.g., Software Engineer"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Organisation"
							htmlFor="organisation_new"
							required
							error={errors.organisation}
						>
							<input
								id="organisation_new"
								type="text"
								value={formValues.organisation}
								onChange={(e) =>
									handleFieldChange("organisation", e.target.value)
								}
								disabled={!FIELD_PERMISSIONS.organisation}
								placeholder="Enter company/organisation name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
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
							Add Parent/Guardian
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

// ==================== SINGLE PARENT RECORD FORM ====================
interface ParentRecordFormProps {
	record: ParentItem;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

function ParentRecordForm({
	record,
	onSuccess,
	onError
}: ParentRecordFormProps) {
	const queryClient = useQueryClient();
	const [isExpanded, setIsExpanded] = useState(false);

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (values: UpdateFormValues) => {
			console.log("=== SUBMITTING TO API ===");
			console.log("Values:", values);

			const response = await api.patch(
				`/parent-details/parent/${record.id}`,
				values
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
				queryKey: ["parent-details", record.user_id]
			});
			setIsExpanded(false);
			onSuccess?.();
		}
	});

	// Form state
	const [formValues, setFormValues] = useState<UpdateFormValues>({
		email: record.email,
		name: record.name,
		occupation: record.occupation,
		organisation: record.organisation,
		parent_type: record.parent_type,
		phone_number: record.phone_number
	});

	// Sync form values with record when it changes
	useEffect(() => {
		setFormValues({
			email: record.email,
			name: record.name,
			occupation: record.occupation,
			organisation: record.organisation,
			parent_type: record.parent_type,
			phone_number: record.phone_number
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

	const parentTypeLabel = record.parent_type || "Not Set";
	const parentIcon = (
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
				d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
			/>
		</svg>
	);

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			{/* Header */}
			<div
				className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 flex-1">
						<div className="text-gray-500">{parentIcon}</div>
						<div>
							<h4 className="font-semibold text-lg text-gray-900">
								{parentTypeLabel}
							</h4>
							<p className="text-sm text-gray-600 mt-1">
								{record.name || "Name not set"} •{" "}
								{record.phone_number || "Phone not set"}
							</p>
						</div>
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

					{/* Parent Type */}
					<FormField label="Parent Type" htmlFor={`parent_type_${record.id}`}>
						<select
							id={`parent_type_${record.id}`}
							value={formValues.parent_type ?? ""}
							onChange={(e) =>
								handleFieldChange(
									"parent_type",
									e.target.value === "" ? null : e.target.value
								)
							}
							disabled={!FIELD_PERMISSIONS.parent_type}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						>
							<option value="">Select type</option>
							<option value="Father">Father</option>
							<option value="Mother">Mother</option>
							<option value="Guardian">Guardian</option>
						</select>
					</FormField>

					{/* Name */}
					<FormField label="Name" htmlFor={`name_${record.id}`}>
						<input
							id={`name_${record.id}`}
							type="text"
							value={formValues.name ?? ""}
							onChange={(e) =>
								handleFieldChange("name", e.target.value || null)
							}
							disabled={!FIELD_PERMISSIONS.name}
							placeholder="Enter full name"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Email and Phone */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Email" htmlFor={`email_${record.id}`}>
							<input
								id={`email_${record.id}`}
								type="email"
								value={formValues.email ?? ""}
								onChange={(e) =>
									handleFieldChange("email", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.email}
								placeholder="parent@example.com"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField label="Phone Number" htmlFor={`phone_${record.id}`}>
							<input
								id={`phone_${record.id}`}
								type="tel"
								value={formValues.phone_number ?? ""}
								onChange={(e) =>
									handleFieldChange("phone_number", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.phone_number}
								placeholder="+91 9876543210"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Occupation and Organisation */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField label="Occupation" htmlFor={`occupation_${record.id}`}>
							<input
								id={`occupation_${record.id}`}
								type="text"
								value={formValues.occupation ?? ""}
								onChange={(e) =>
									handleFieldChange("occupation", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.occupation}
								placeholder="e.g., Software Engineer"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Organisation"
							htmlFor={`organisation_${record.id}`}
						>
							<input
								id={`organisation_${record.id}`}
								type="text"
								value={formValues.organisation ?? ""}
								onChange={(e) =>
									handleFieldChange("organisation", e.target.value || null)
								}
								disabled={!FIELD_PERMISSIONS.organisation}
								placeholder="Enter company/organisation name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
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
									email: record.email,
									name: record.name,
									occupation: record.occupation,
									organisation: record.organisation,
									parent_type: record.parent_type,
									phone_number: record.phone_number
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
interface ParentDetailsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function ParentDetailsForm({
	userId,
	onSuccess,
	onError
}: ParentDetailsFormProps) {
	// Fetch parent details
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetParentDetailsResponse>(
				`/parent-details/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["parent-details", userId]
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
				Error loading parent details: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Parent/Guardian Details
			</h2>

			{/* Add New Parent Form */}
			<AddParentForm userId={userId} onSuccess={onSuccess} onError={onError} />

			{/* Existing Parent Records */}
			{data && data.length > 0 ? (
				data.map((record) => (
					<ParentRecordForm
						key={record.id}
						record={record}
						onSuccess={onSuccess}
						onError={onError}
					/>
				))
			) : (
				<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No parent/guardian details found. Add your first record above.
				</div>
			)}
		</div>
	);
}
