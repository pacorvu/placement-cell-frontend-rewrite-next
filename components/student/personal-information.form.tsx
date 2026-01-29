import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const getPersonalDetailsResponseSchema = z.object({
	created_at: z.string().datetime(),
	date_of_birth: z.string().date().nullable(),
	email: z.string().email(),
	full_name: z.string().nullable(),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
	languages: z.array(z.string()).nullable(),
	major_name: z.string().nullable(),
	minor_name: z.string().nullable(),
	personal_email: z.string().email().nullable(),
	profile_image: z.string().nullable(),
	profile_image_signed_url: z.string().nullable(),
	program_name: z.string().nullable(),
	school_name: z.string().nullable(),
	specialization_name: z.string().nullable(),
	specially_abled: z.boolean().nullable(),
	updated_at: z.string().datetime(),
	user_id: z.number(),
	usn: z.string(),
	verification_type: z.string().nullable(),
	year_of_joining: z.number().nullable()
});

const updatePersonalDetailsRequestSchema = z.object({
	date_of_birth: z.string().date().nullable(),
	full_name: z.string().nullable(),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
	languages: z.array(z.string()).nullable(),
	major_id: z.number().int().nullable(),
	minor_id: z.number().int().nullable(),
	personal_email: z.string().email().nullable().or(z.literal("")),
	profile_image: z.string().nullable(),
	program_id: z.number().int().nullable(),
	school_id: z.number().int().nullable(),
	specialization_id: z.number().int().nullable(),
	specially_abled: z.boolean().nullable(),
	verification_type: z.string().nullable(),
	year_of_joining: z.number().int().nullable()
});

type GetPersonalDetailsResponse = z.infer<
	typeof getPersonalDetailsResponseSchema
>;
type UpdatePersonalDetailsRequest = z.infer<
	typeof updatePersonalDetailsRequestSchema
>;

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
	date_of_birth: true,
	full_name: true,
	gender: true,
	languages: true,
	major_id: true,
	minor_id: true,
	personal_email: true,
	profile_image: false, // Disabled
	program_id: true,
	school_id: true,
	specialization_id: true,
	specially_abled: true,
	verification_type: true,
	year_of_joining: true
} as const;

// ==================== COMPONENT ====================
interface PersonalDetailsFormProps {
	userId: number;
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
}

export default function PersonalDetailsForm({
	userId,
	onSuccess,
	onError
}: PersonalDetailsFormProps) {
	const queryClient = useQueryClient();
	const [languageInput, setLanguageInput] = useState("");

	// Fetch personal details
	const { data, isLoading, isError, error } = useQuery({
		enabled: !!userId,
		queryFn: async () => {
			const response = await api.get<GetPersonalDetailsResponse>(
				`/students/personal-details/user/${userId}`
			);
			return response.data;
		},
		queryKey: ["personal-details", userId]
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (values: UpdatePersonalDetailsRequest) => {
			const response = await api.patch(
				`/students/personal-details/user/${userId}`,
				{
					...values,
					languages: values.languages ? values.languages.join(",") : "", // Convert array to CSV
					profile_image: null
				},
				{
					headers: {
						"Content-Type": "multipart/form-data"
					}
				}
			);
			return response.data;
		},
		onError: (error: any) => {
			onError?.(error);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["personal-details", userId] });
			onSuccess?.(data);
		}
	});

	// TanStack Form setup
	const form = useForm<UpdatePersonalDetailsRequest>({
		defaultValues: {
			date_of_birth: null,
			full_name: null,
			gender: null,
			languages: null,
			major_id: null,
			minor_id: null,
			personal_email: null,
			profile_image: null,
			program_id: null,
			school_id: null,
			specialization_id: null,
			specially_abled: null,
			verification_type: null,
			year_of_joining: null
		},
		onSubmit: async ({ value }) => {
			await updateMutation.mutateAsync(value);
		},
		validators: {
			onBlur: updatePersonalDetailsRequestSchema
		}
	});

	// Initialize form values when data loads
	useEffect(() => {
		if (data && !form.state.isDirty) {
			form.setFieldValue("date_of_birth", data.date_of_birth);
			form.setFieldValue("full_name", data.full_name);
			form.setFieldValue("gender", data.gender);
			form.setFieldValue("languages", data.languages);
			form.setFieldValue("personal_email", data.personal_email);
			form.setFieldValue("specially_abled", data.specially_abled);
			form.setFieldValue("verification_type", data.verification_type);
			form.setFieldValue("year_of_joining", data.year_of_joining);
		}
	}, [data, form]);

	// Reset form to initial data
	const handleReset = () => {
		if (data) {
			form.setFieldValue("date_of_birth", data.date_of_birth);
			form.setFieldValue("full_name", data.full_name);
			form.setFieldValue("gender", data.gender);
			form.setFieldValue("languages", data.languages);
			form.setFieldValue("personal_email", data.personal_email);
			form.setFieldValue("specially_abled", data.specially_abled);
			form.setFieldValue("verification_type", data.verification_type);
			form.setFieldValue("year_of_joining", data.year_of_joining);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg">
				Error loading personal details: {(error as Error)?.message}
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6 max-w-4xl"
		>
			{/* Read-only fields */}
			<div className="space-y-4 rounded-lg border border-gray-200 p-6 bg-gray-50">
				<h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
					Read-only Information
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<ReadOnlyField label="USN" value={data?.usn} />
					<ReadOnlyField label="User ID" value={data?.user_id} />
					<ReadOnlyField label="Email" value={data?.email} />
					<ReadOnlyField
						label="School"
						value={data?.school_name || "Not set"}
					/>
					<ReadOnlyField
						label="Program"
						value={data?.program_name || "Not set"}
					/>
					<ReadOnlyField
						label="Specialization"
						value={data?.specialization_name || "Not set"}
					/>
				</div>
			</div>

			{/* Editable fields */}
			<div className="space-y-4 rounded-lg border border-gray-200 p-6">
				<h3 className="font-semibold text-lg mb-4">Personal Information</h3>

				{/* Full Name */}
				<form.Field
					name="full_name"
					validators={{
						onBlur: z.string().nullable()
					}}
				>
					{(field) => (
						<FormField
							label="Full Name"
							htmlFor="full_name"
							error={field.state.meta.errors?.[0]}
						>
							<input
								id="full_name"
								type="text"
								value={field.state.value ?? ""}
								onChange={(e) => field.handleChange(e.target.value || null)}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.full_name}
								placeholder="Enter full name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</FormField>
					)}
				</form.Field>

				{/* Gender */}
				<form.Field
					name="gender"
					validators={{
						onBlur: z.enum(["MALE", "FEMALE", "OTHER"]).nullable()
					}}
				>
					{(field) => (
						<FormField
							label="Gender"
							htmlFor="gender"
							error={field.state.meta.errors?.[0]}
						>
							<select
								id="gender"
								value={field.state.value ?? ""}
								onChange={(e) =>
									field.handleChange(
										e.target.value === "" ? null : (e.target.value as any)
									)
								}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.gender}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							>
								<option value="">Select gender</option>
								<option value="MALE">Male</option>
								<option value="FEMALE">Female</option>
								<option value="OTHER">Other</option>
							</select>
						</FormField>
					)}
				</form.Field>

				{/* Date of Birth */}
				<form.Field
					name="date_of_birth"
					validators={{
						onBlur: z.string().date().nullable()
					}}
				>
					{(field) => (
						<FormField
							label="Date of Birth"
							htmlFor="date_of_birth"
							error={field.state.meta.errors?.[0]}
						>
							<input
								id="date_of_birth"
								type="date"
								value={field.state.value ?? ""}
								onChange={(e) => field.handleChange(e.target.value || null)}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.date_of_birth}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</FormField>
					)}
				</form.Field>

				{/* Personal Email */}
				<form.Field
					name="personal_email"
					validators={{
						onBlur: z.string().email().nullable().or(z.literal(""))
					}}
				>
					{(field) => (
						<FormField
							label="Personal Email"
							htmlFor="personal_email"
							error={field.state.meta.errors?.[0]}
						>
							<input
								id="personal_email"
								type="email"
								value={field.state.value ?? ""}
								onChange={(e) => field.handleChange(e.target.value || null)}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.personal_email}
								placeholder="personal@example.com"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</FormField>
					)}
				</form.Field>

				{/* Year of Joining */}
				<form.Field
					name="year_of_joining"
					validators={{
						onBlur: z.number().int().nullable()
					}}
				>
					{(field) => (
						<FormField
							label="Year of Joining"
							htmlFor="year_of_joining"
							error={field.state.meta.errors?.[0]}
						>
							<input
								id="year_of_joining"
								type="number"
								value={field.state.value ?? ""}
								onChange={(e) => {
									const val =
										e.target.value === "" ? null : parseInt(e.target.value, 10);
									field.handleChange(val);
								}}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.year_of_joining}
								placeholder="2024"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</FormField>
					)}
				</form.Field>

				{/* Specially Abled */}
				<form.Field
					name="specially_abled"
					validators={{
						onBlur: z.boolean().nullable()
					}}
				>
					{(field) => (
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="specially_abled"
								checked={field.state.value ?? false}
								onChange={(e) => field.handleChange(e.target.checked)}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.specially_abled}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
							/>
							<label
								htmlFor="specially_abled"
								className="text-sm font-medium text-gray-700 cursor-pointer"
							>
								Specially Abled
							</label>
						</div>
					)}
				</form.Field>

				{/* Languages */}
				<form.Field
					name="languages"
					validators={{
						onBlur: z.array(z.string()).nullable()
					}}
				>
					{(field) => (
						<FormField label="Languages" error={field.state.meta.errors?.[0]}>
							<LanguagesInput
								value={field.state.value ?? []}
								onChange={field.handleChange}
								disabled={!FIELD_PERMISSIONS.languages}
								languageInput={languageInput}
								setLanguageInput={setLanguageInput}
							/>
						</FormField>
					)}
				</form.Field>

				{/* Verification Type */}
				<form.Field
					name="verification_type"
					validators={{
						onBlur: z.string().nullable()
					}}
				>
					{(field) => (
						<FormField
							label="Verification Type"
							htmlFor="verification_type"
							error={field.state.meta.errors?.[0]}
						>
							<input
								id="verification_type"
								type="text"
								value={field.state.value ?? ""}
								onChange={(e) => field.handleChange(e.target.value || null)}
								onBlur={field.handleBlur}
								disabled={!FIELD_PERMISSIONS.verification_type}
								placeholder="Enter verification type"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</FormField>
					)}
				</form.Field>
			</div>

			{/* Submit Button */}
			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<div className="flex gap-4">
						<button
							type="submit"
							disabled={!canSubmit || isSubmitting}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isSubmitting && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
							)}
							Save Changes
						</button>
						<button
							type="button"
							onClick={handleReset}
							disabled={isSubmitting}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							Reset
						</button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}

// ==================== HELPER COMPONENTS ====================
interface ReadOnlyFieldProps {
	label: string;
	value: string | number | undefined;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label}
			</label>
			<input
				type="text"
				value={value || ""}
				disabled
				className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
			/>
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

interface LanguagesInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	disabled: boolean;
	languageInput: string;
	setLanguageInput: (value: string) => void;
}

function LanguagesInput({
	value,
	onChange,
	disabled,
	languageInput,
	setLanguageInput
}: LanguagesInputProps) {
	const addLanguage = () => {
		if (languageInput.trim()) {
			onChange([...value, languageInput.trim()]);
			setLanguageInput("");
		}
	};

	const removeLanguage = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div>
			<div className="flex gap-2 mb-2">
				<input
					type="text"
					value={languageInput}
					onChange={(e) => setLanguageInput(e.target.value)}
					placeholder="Add a language"
					disabled={disabled}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addLanguage();
						}
					}}
					className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
				/>
				<button
					type="button"
					onClick={addLanguage}
					disabled={disabled}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					Add
				</button>
			</div>
			<div className="flex flex-wrap gap-2">
				{value.map((lang, index) => (
					<div
						key={index}
						className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
					>
						<span className="text-sm">{lang}</span>
						<button
							type="button"
							onClick={() => removeLanguage(index)}
							disabled={disabled}
							className="text-blue-600 hover:text-blue-800 font-bold disabled:cursor-not-allowed"
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
