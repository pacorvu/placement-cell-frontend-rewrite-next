import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const profileDetailsSchema = z.object({
	brief_summary: z.string(),
	career_objective: z.string(),
	created_at: z.string().datetime(),
	dream_company: z.string(),
	dream_package: z.number(),
	hobbies_interests: z.array(z.string()),
	key_expertise: z.string(),
	updated_at: z.string().datetime(),
	user_id: z.number().int(),
	usn: z.string()
});

const createProfileDetailsRequestSchema = z.object({
	brief_summary: z.string(),
	career_objective: z.string(),
	dream_company: z.string(),
	dream_package: z.number(),
	hobbies_interests: z.array(z.string()),
	key_expertise: z.string()
});

type ProfileDetails = z.infer<typeof profileDetailsSchema>;
type CreateProfileDetailsRequest = z.infer<
	typeof createProfileDetailsRequestSchema
>;

// Form values type
type FormValues = {
	brief_summary: string;
	key_expertise: string;
	hobbies_interests: string[];
	career_objective: string;
	dream_package: number;
	dream_company: string;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	brief_summary: true,
	career_objective: true,
	dream_company: true,
	dream_package: true,
	hobbies_interests: true,
	key_expertise: true
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
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const addItem = () => {
		if (input.trim()) {
			if (editingIndex !== null) {
				// Update existing item
				const newArray = [...value];
				newArray[editingIndex] = input.trim();
				onChange(newArray);
				setEditingIndex(null);
			} else {
				// Add new item
				onChange([...value, input.trim()]);
			}
			setInput("");
		}
	};

	const editItem = (index: number) => {
		setInput(value[index]);
		setEditingIndex(index);
	};

	const removeItem = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const cancelEdit = () => {
		setInput("");
		setEditingIndex(null);
	};

	return (
		<div>
			{/* Input Form */}
			<div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
				<div>
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
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
					/>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={addItem}
						disabled={disabled || !input.trim()}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
					>
						{editingIndex !== null ? "Update" : "Add"}
					</button>
					{editingIndex !== null && (
						<button
							type="button"
							onClick={cancelEdit}
							disabled={disabled}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium"
						>
							Cancel
						</button>
					)}
				</div>
			</div>

			{/* Items List */}
			{value.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-medium text-gray-700 mb-2">
						Added Items ({value.length})
					</p>
					<div className="space-y-2">
						{value.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
							>
								<div className="flex-1 min-w-0">
									<span className="text-sm text-gray-900">{item}</span>
								</div>
								<div className="flex items-center gap-2 ml-4">
									<button
										type="button"
										onClick={() => editItem(index)}
										disabled={disabled}
										className="p-1 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
										title="Edit item"
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
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<button
										type="button"
										onClick={() => removeItem(index)}
										disabled={disabled}
										className="p-1 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed"
										title="Remove item"
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
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{value.length === 0 && (
				<div className="mt-4 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No items added yet. Add your first item above.
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

// ==================== MAIN FORM COMPONENT ====================
interface ProfileDetailsFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function ProfileDetailsForm({
	userId,
	onSuccess,
	onError
}: ProfileDetailsFormProps) {
	const queryClient = useQueryClient();

	// Initial empty form values
	const initialFormValues: FormValues = {
		brief_summary: "",
		career_objective: "",
		dream_company: "",
		dream_package: 0,
		hobbies_interests: [],
		key_expertise: ""
	};

	const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

	const [errors, setErrors] = useState<
		Partial<Record<keyof FormValues, string>>
	>({});

	// Fetch existing profile details
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			try {
				const response = await api.get<ProfileDetails>(
					`/profile-details/user/${userId}`
				);
				return response.data;
			} catch (err: any) {
				// If 404, return null (no profile exists yet)
				if (err.response?.status === 404) {
					return null;
				}
				throw err;
			}
		},
		queryKey: ["profile-details", userId]
	});

	// Determine if we're creating or updating
	const isCreating = !data;

	// Sync form values with fetched data
	useEffect(() => {
		if (data) {
			setFormValues({
				brief_summary: data.brief_summary,
				career_objective: data.career_objective,
				dream_company: data.dream_company,
				dream_package: data.dream_package,
				hobbies_interests: data.hobbies_interests || [],
				key_expertise: data.key_expertise
			});
		}
	}, [data]);

	// Create/Update mutation - using JSON
	const saveMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log(
				isCreating
					? "=== CREATING PROFILE DETAILS ==="
					: "=== UPDATING PROFILE DETAILS ==="
			);
			console.log("Values:", values);

			const payload = {
				brief_summary: values.brief_summary,
				career_objective: values.career_objective,
				dream_company: values.dream_company,
				dream_package: values.dream_package,
				hobbies_interests: values.hobbies_interests,
				key_expertise: values.key_expertise
			};

			console.log("Payload:", JSON.stringify(payload, null, 2));

			const response = isCreating
				? await api.post(`/profile-details/user/${userId}`, payload, {
						headers: {
							"Content-Type": "application/json"
						}
					})
				: await api.patch(`/profile-details/user/${userId}`, payload, {
						headers: {
							"Content-Type": "application/json"
						}
					});

			console.log("Response:", response.data);
			return response.data;
		},
		onError: (error: any) => {
			console.error("Save error:", error);
			onError?.(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["profile-details", userId]
			});
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof FormValues, string>> = {};

		if (!formValues.brief_summary.trim()) {
			newErrors.brief_summary = "Brief summary is required";
		}
		if (!formValues.key_expertise.trim()) {
			newErrors.key_expertise = "Key expertise is required";
		}
		if (!formValues.career_objective.trim()) {
			newErrors.career_objective = "Career objective is required";
		}
		if (formValues.dream_package <= 0) {
			newErrors.dream_package = "Dream package must be greater than 0";
		}
		if (!formValues.dream_company.trim()) {
			newErrors.dream_company = "Dream company is required";
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

		await saveMutation.mutateAsync(formValues);
	};

	const handleFieldChange = <K extends keyof FormValues>(
		field: K,
		value: FormValues[K]
	) => {
		console.log(`Field ${field} changed to:`, value);
		setFormValues((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (isError && error) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg">
				Error loading profile details: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<div className="border border-gray-200 rounded-lg overflow-hidden">
				{/* Header */}
				<div className="bg-gray-50 px-6 py-4">
					<h2 className="text-2xl font-bold text-gray-900">Profile Details</h2>
					<p className="text-sm text-gray-600 mt-1">
						{isCreating
							? "Add your professional profile information"
							: "Update your professional profile information"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
					{/* Read-only fields (only show if updating) */}
					{!isCreating && data && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									User ID
								</label>
								<input
									type="text"
									value={data.user_id}
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
									value={data.usn}
									disabled
									className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Updated
								</label>
								<input
									type="text"
									value={new Date(data.updated_at).toLocaleDateString()}
									disabled
									className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
								/>
							</div>
						</div>
					)}

					{/* Brief Summary */}
					<FormField
						label="Brief Summary"
						htmlFor="brief_summary"
						required
						error={errors.brief_summary}
					>
						<textarea
							id="brief_summary"
							value={formValues.brief_summary}
							onChange={(e) =>
								handleFieldChange("brief_summary", e.target.value)
							}
							disabled={!FIELD_PERMISSIONS.brief_summary}
							placeholder="Write a brief professional summary about yourself (2-3 sentences)"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Key Expertise */}
					<FormField
						label="Key Expertise"
						htmlFor="key_expertise"
						required
						error={errors.key_expertise}
					>
						<textarea
							id="key_expertise"
							value={formValues.key_expertise}
							onChange={(e) =>
								handleFieldChange("key_expertise", e.target.value)
							}
							disabled={!FIELD_PERMISSIONS.key_expertise}
							placeholder="Describe your core competencies and areas of expertise"
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Career Objective */}
					<FormField
						label="Career Objective"
						htmlFor="career_objective"
						required
						error={errors.career_objective}
					>
						<textarea
							id="career_objective"
							value={formValues.career_objective}
							onChange={(e) =>
								handleFieldChange("career_objective", e.target.value)
							}
							disabled={!FIELD_PERMISSIONS.career_objective}
							placeholder="Describe your career goals and aspirations"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Dream Company and Package */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Dream Company"
							htmlFor="dream_company"
							required
							error={errors.dream_company}
						>
							<input
								id="dream_company"
								type="text"
								value={formValues.dream_company}
								onChange={(e) =>
									handleFieldChange("dream_company", e.target.value)
								}
								disabled={!FIELD_PERMISSIONS.dream_company}
								placeholder="e.g., Google, Microsoft, Amazon"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>

						<FormField
							label="Dream Package (in LPA)"
							htmlFor="dream_package"
							required
							error={errors.dream_package}
						>
							<input
								id="dream_package"
								type="number"
								step="0.01"
								value={formValues.dream_package}
								onChange={(e) =>
									handleFieldChange(
										"dream_package",
										parseFloat(e.target.value) || 0
									)
								}
								disabled={!FIELD_PERMISSIONS.dream_package}
								placeholder="e.g., 15.5"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
							/>
						</FormField>
					</div>

					{/* Hobbies & Interests */}
					<FormField label="Hobbies & Interests">
						<ArrayInput
							value={formValues.hobbies_interests}
							onChange={(hobbies) =>
								handleFieldChange("hobbies_interests", hobbies)
							}
							disabled={!FIELD_PERMISSIONS.hobbies_interests}
							placeholder="Add a hobby or interest (e.g., Reading, Photography, Gaming)"
						/>
						<p className="text-xs text-gray-500 mt-2">
							Add your hobbies and personal interests
						</p>
					</FormField>

					{/* Action Buttons */}
					<div className="flex gap-4 pt-4 border-t border-gray-200">
						<button
							type="submit"
							disabled={saveMutation.isPending}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{saveMutation.isPending && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							)}
							{isCreating ? "Create Profile" : "Save Changes"}
						</button>
						{!isCreating && (
							<button
								type="button"
								onClick={() => {
									if (data) {
										setFormValues({
											brief_summary: data.brief_summary,
											career_objective: data.career_objective,
											dream_company: data.dream_company,
											dream_package: data.dream_package,
											hobbies_interests: data.hobbies_interests || [],
											key_expertise: data.key_expertise
										});
										setErrors({});
									}
								}}
								disabled={saveMutation.isPending}
								className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
							>
								Reset
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
