import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const profileCommunicationSchema = z.object({
	phone_number: z.string(),
	links: z.record(z.string(), z.string()),
	id: z.number().int(),
	usn: z.string(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

const createProfileCommunicationRequestSchema = z.object({
	phone_number: z.string(),
	links: z.record(z.string(), z.string())
});

type ProfileCommunication = z.infer<typeof profileCommunicationSchema>;
type CreateProfileCommunicationRequest = z.infer<
	typeof createProfileCommunicationRequestSchema
>;

// Form values type
type FormValues = {
	phone_number: string;
	links: Record<string, string>;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	phone_number: true,
	links: true
} as const;

// ==================== HELPER COMPONENTS ====================
interface LinksInputProps {
	value: Record<string, string>;
	onChange: (value: Record<string, string>) => void;
	disabled: boolean;
}

function LinksInput({ value, onChange, disabled }: LinksInputProps) {
	const [linkKey, setLinkKey] = useState("");
	const [linkValue, setLinkValue] = useState("");
	const [editingKey, setEditingKey] = useState<string | null>(null);

	const addLink = () => {
		if (linkKey.trim() && linkValue.trim()) {
			// Check if key already exists
			if (linkKey.trim() in value && !editingKey) {
				alert("A link with this name already exists");
				return;
			}

			if (editingKey) {
				// Update existing link
				const newLinks = { ...value };
				// If key changed, remove old key
				if (editingKey !== linkKey.trim()) {
					delete newLinks[editingKey];
				}
				newLinks[linkKey.trim()] = linkValue.trim();
				onChange(newLinks);
				setEditingKey(null);
			} else {
				// Add new link
				onChange({ ...value, [linkKey.trim()]: linkValue.trim() });
			}

			setLinkKey("");
			setLinkValue("");
		}
	};

	const editLink = (key: string) => {
		setLinkKey(key);
		setLinkValue(value[key]);
		setEditingKey(key);
	};

	const removeLink = (key: string) => {
		const newLinks = { ...value };
		delete newLinks[key];
		onChange(newLinks);
	};

	const cancelEdit = () => {
		setLinkKey("");
		setLinkValue("");
		setEditingKey(null);
	};

	const linkEntries = Object.entries(value);

	return (
		<div>
			{/* Input Form */}
			<div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">
							Link Name
						</label>
						<input
							type="text"
							value={linkKey}
							onChange={(e) => setLinkKey(e.target.value)}
							placeholder="e.g., GitHub, LinkedIn"
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
						/>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">
							Link URL
						</label>
						<input
							type="url"
							value={linkValue}
							onChange={(e) => setLinkValue(e.target.value)}
							placeholder="e.g., https://github.com/username"
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={addLink}
						disabled={disabled || !linkKey.trim() || !linkValue.trim()}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
					>
						{editingKey ? "Update Link" : "Add Link"}
					</button>
					{editingKey && (
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

			{/* Links List */}
			{linkEntries.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-medium text-gray-700 mb-2">
						Added Links ({linkEntries.length})
					</p>
					<div className="space-y-2">
						{linkEntries.map(([key, url]) => (
							<div
								key={key}
								className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="text-sm font-medium text-gray-900">
											{key}
										</span>
									</div>
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-blue-600 hover:text-blue-800 truncate block"
									>
										{url}
									</a>
								</div>
								<div className="flex items-center gap-2 ml-4">
									<button
										type="button"
										onClick={() => editLink(key)}
										disabled={disabled}
										className="p-1 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
										title="Edit link"
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
										onClick={() => removeLink(key)}
										disabled={disabled}
										className="p-1 text-gray-500 hover:text-red-600 disabled:cursor-not-allowed"
										title="Remove link"
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

			{linkEntries.length === 0 && (
				<div className="mt-4 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
					No links added yet. Add your first link above.
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
interface ProfileCommunicationFormProps {
	userId: number;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export default function ProfileCommunicationForm({
	userId,
	onSuccess,
	onError
}: ProfileCommunicationFormProps) {
	const queryClient = useQueryClient();

	// Initial empty form values
	const initialFormValues: FormValues = {
		phone_number: "",
		links: {}
	};

	const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

	const [errors, setErrors] = useState<
		Partial<Record<keyof FormValues, string>>
	>({});

	// Fetch existing profile communication
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			try {
				const response = await api.get<ProfileCommunication>(
					`/profile-communication/user/${userId}`
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
		queryKey: ["profile-communication", userId]
	});

	// Determine if we're creating or updating
	const isCreating = !data;

	// Sync form values with fetched data
	useEffect(() => {
		if (data) {
			setFormValues({
				phone_number: data.phone_number,
				links: data.links || {}
			});
		}
	}, [data]);

	// Create/Update mutation - using JSON
	const saveMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			console.log(
				isCreating
					? "=== CREATING PROFILE COMMUNICATION ==="
					: "=== UPDATING PROFILE COMMUNICATION ==="
			);
			console.log("Values:", values);

			const payload = {
				phone_number: values.phone_number,
				links: values.links
			};

			console.log("Payload:", JSON.stringify(payload, null, 2));

			const response = isCreating
				? await api.post(`/profile-communication/user/${userId}`, payload, {
						headers: {
							"Content-Type": "application/json"
						}
					})
				: await api.patch(`/profile-communication/user/${userId}`, payload, {
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
				queryKey: ["profile-communication", userId]
			});
			onSuccess?.();
		}
	});

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof FormValues, string>> = {};

		if (!formValues.phone_number.trim()) {
			newErrors.phone_number = "Phone number is required";
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
				Error loading profile communication: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-4xl">
			<div className="border border-gray-200 rounded-lg overflow-hidden">
				{/* Header */}
				<div className="bg-gray-50 px-6 py-4">
					<h2 className="text-2xl font-bold text-gray-900">
						Profile Communication
					</h2>
					<p className="text-sm text-gray-600 mt-1">
						{isCreating
							? "Add your contact information and social links"
							: "Update your contact information and social links"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
					{/* Read-only fields (only show if updating) */}
					{!isCreating && data && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									ID
								</label>
								<input
									type="text"
									value={data.id}
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

					{/* Phone Number */}
					<FormField
						label="Phone Number"
						htmlFor="phone_number"
						required
						error={errors.phone_number}
					>
						<input
							id="phone_number"
							type="tel"
							value={formValues.phone_number}
							onChange={(e) =>
								handleFieldChange("phone_number", e.target.value)
							}
							disabled={!FIELD_PERMISSIONS.phone_number}
							placeholder="e.g., +91 9876543210"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
						/>
					</FormField>

					{/* Links */}
					<FormField label="Social Links & Profiles">
						<LinksInput
							value={formValues.links}
							onChange={(links) => handleFieldChange("links", links)}
							disabled={!FIELD_PERMISSIONS.links}
						/>
						<p className="text-xs text-gray-500 mt-2">
							Add your social media profiles and other links. Example: Link Name
							= "GitHub", Link URL = "https://github.com/username"
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
											phone_number: data.phone_number,
											links: data.links || {}
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
