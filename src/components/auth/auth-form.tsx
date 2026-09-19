"use client";

import type { FormEvent, ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthFormProps {
	title: string;
	subtitle?: ReactNode;
	error?: string;
	success?: string;
	onClearAlert?: () => void;
	onSubmit?: (e: FormEvent) => void;
	children: ReactNode;
	footer?: ReactNode;
	className?: string;
}

export function AuthForm({
	title,
	subtitle,
	error,
	success,
	onClearAlert,
	onSubmit,
	children,
	footer,
	className,
}: AuthFormProps) {
	const alertText = error ?? success;
	const isError = Boolean(error);

	return (
		<Card className={cn("rounded-3xl p-2", className)}>
			<CardHeader className="relative pb-2 pt-6 text-center">
				<CardTitle className="text-2xl font-semibold tracking-tighter sm:text-3xl">
					{title}
				</CardTitle>
				{subtitle && (
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						{subtitle}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent className="p-6 pt-0">
				{alertText && (
					<div
						role="alert"
						className={cn(
							"mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm",
							isError
								? "border-status-critical/25 bg-status-critical-bg text-status-critical"
								: "border-status-ok/25 bg-status-ok-bg text-status-ok",
						)}
					>
						{isError ? (
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
						) : (
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						)}
						<p className="flex-1">{alertText}</p>
						{onClearAlert && (
							<button
								type="button"
								onClick={onClearAlert}
								aria-label="Dismiss alert"
								className="shrink-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit?.(e);
					}}
					noValidate
					className="space-y-5"
				>
					{children}
				</form>

				{footer && (
					<div className="mt-8 border-t border-border pt-6 text-center">{footer}</div>
				)}
			</CardContent>
		</Card>
	);
}