import { ExternalLinkIcon, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSectionProps {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

export function FormSection({
	title,
	description,
	children,
	className
}: FormSectionProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	);
}

interface FormGridProps {
	children: ReactNode;
	columns?: 1 | 2 | 3;
	className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
	return (
		<div
			className={cn(
				"grid gap-4",
				{
					"grid-cols-1": columns === 1,
					"grid-cols-1 md:grid-cols-2": columns === 2,
					"grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3
				},
				className
			)}
		>
			{children}
		</div>
	);
}

interface FormFieldProps {
	label: string;
	htmlFor?: string;
	error?: string;
	helpText?: string;
	required?: boolean;
	children: ReactNode;
	className?: string;
}

export function FormField({
	label,
	htmlFor,
	error,
	helpText,
	required,
	children,
	className
}: FormFieldProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={htmlFor} className={error ? "text-destructive" : ""}>
				{label}
				{required && <span className="text-destructive ml-1">*</span>}
			</Label>
			{children}
			{error && <p className="text-sm text-destructive">{error}</p>}
			{helpText && !error && (
				<p className="text-sm text-muted-foreground">{helpText}</p>
			)}
		</div>
	);
}

interface ExternalLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"inline-flex items-center gap-1 text-sm text-primary hover:underline",
				className
			)}
		>
			<ExternalLinkIcon className="h-4 w-4" />
			{children}
		</a>
	);
}

interface RepeatableItemProps {
	title: string;
	onRemove: () => void;
	canRemove?: boolean;
	children: ReactNode;
}

export function RepeatableItem({
	title,
	onRemove,
	canRemove = true,
	children
}: RepeatableItemProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="space-y-4">
					<div className="flex items-start justify-between">
						<h3 className="font-medium">{title}</h3>
						{canRemove && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={onRemove}
								className="h-8 w-8 text-destructive hover:text-destructive"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
					{children}
				</div>
			</CardContent>
		</Card>
	);
}

interface RepeatableSectionProps {
	items: ReactNode[];
	onAdd: () => void;
	addButtonText: string;
	emptyMessage?: string;
	canAdd?: boolean;
}

export function RepeatableSection({
	items,
	onAdd,
	addButtonText,
	emptyMessage = "No items found",
	canAdd = true
}: RepeatableSectionProps) {
	return (
		<div className="space-y-4">
			{items.length === 0 ? (
				<Card>
					<CardContent className="py-12">
						<p className="text-center text-muted-foreground">{emptyMessage}</p>
					</CardContent>
				</Card>
			) : (
				items
			)}
			{canAdd && (
				<Button
					type="button"
					variant="outline"
					onClick={onAdd}
					className="w-full"
				>
					<Plus className="h-4 w-4 mr-2" />
					{addButtonText}
				</Button>
			)}
		</div>
	);
}
