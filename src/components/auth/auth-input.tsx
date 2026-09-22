"use client";

import type {
	ChangeEvent,
	InputHTMLAttributes,
	ReactNode,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AuthInputProps {
	id: string;
	label: string;
	requiredIndicator?: boolean;
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onBlur?: () => void;
	placeholder?: string;
	type?: string;
	error?: string;
	hint?: string;
	leftIcon?: ReactNode;
	disabled?: boolean;
	autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
	inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
	className?: string;
}

export function AuthInput({
	id,
	label,
	requiredIndicator,
	value,
	onChange,
	onBlur,
	placeholder,
	type = "text",
	error,
	hint,
	leftIcon,
	disabled,
	autoComplete,
	inputMode,
	className,
}: AuthInputProps) {
	const inputId =
		id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

	const hasError = Boolean(error);

	const borderStyles = hasError
		? "border-red-500 bg-red-950/10 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
		: "border-[#32364c] focus-visible:border-[#dc2626] focus-visible:ring-1 focus-visible:ring-[#dc2626]";

	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-xs font-semibold text-[#a6abbd] mb-1.5 cursor-pointer"
				>
					{label}
					{requiredIndicator && (
						<span className="text-[#dc2626] ml-1">*</span>
					)}
				</label>
			)}

			<div className="relative flex items-center">
				{leftIcon && (
					<div className="absolute left-3 text-[#72778f] pointer-events-none flex items-center justify-center shrink-0 z-10">
						{leftIcon}
					</div>
				)}

				<Input
					id={inputId}
					type={type}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete={autoComplete}
					inputMode={inputMode}
					aria-invalid={hasError}
					aria-describedby={
						hasError
							? `${inputId}-error`
							: hint
								? `${inputId}-hint`
								: undefined
					}
					className={cn(
						"w-full bg-[#0c0d12] text-[#f8f9fc] placeholder:text-[#72778f] text-sm rounded-[6px] h-11 py-2.5 transition-colors duration-150",
						leftIcon ? "pl-9" : "pl-3.5",
						"pr-3.5",
						borderStyles,
						className
					)}
				/>
			</div>

			{hasError && (
				<div
					id={`${inputId}-error`}
					className="flex items-start gap-1.5 mt-1.5 text-xs text-red-300 bg-red-950/30 border border-red-800/40 rounded px-2.5 py-1"
				>
					<AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			{!hasError && hint && (
				<p
					id={`${inputId}-hint`}
					className="text-[11px] text-[#72778f] mt-1 leading-normal"
				>
					{hint}
				</p>
			)}
		</div>
	);
}