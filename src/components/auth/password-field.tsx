"use client";

import { useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
	id: string;
	label: string;
	requiredIndicator?: boolean;
	headerAction?: ReactNode;
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onBlur?: () => void;
	placeholder?: string;
	error?: string;
	hint?: string;
	disabled?: boolean;
	autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}

export function PasswordField({
	id,
	label,
	requiredIndicator,
	headerAction,
	value,
	onChange,
	onBlur,
	placeholder,
	error,
	hint,
	disabled,
	autoComplete,
}: PasswordFieldProps) {
	const [showPassword, setShowPassword] = useState(false);

	const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
	const hasError = Boolean(error);

	const borderStyles = hasError
		? "border-red-500 bg-red-950/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
		: "border-[#32364c] focus:border-[#dc2626] focus:ring-2 focus:ring-[rgba(220,38,38,0.2)]";

	return (
		<div className="w-full">
			<div className="flex items-center justify-between mb-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-xs font-semibold text-[#a6abbd]"
					>
						{label}
						{requiredIndicator && (
							<span className="text-[#dc2626] ml-1">*</span>
						)}
					</label>
				)}

				{headerAction && <div>{headerAction}</div>}
			</div>

			<div className="relative flex items-center">
				<div className="absolute left-3 text-[#72778f] pointer-events-none flex items-center justify-center shrink-0">
					<Lock className="w-4 h-4" />
				</div>

				<input
					id={inputId}
					type={showPassword ? "text" : "password"}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete={autoComplete}
					aria-invalid={hasError}
					aria-describedby={
						hasError
							? `${inputId}-error`
							: hint
								? `${inputId}-hint`
								: undefined
					}
					className={`w-full bg-[#0c0d12] text-[#f8f9fc] placeholder-[#72778f] text-sm rounded-[6px] border py-2.5 pl-9 pr-11 font-mono transition-colors duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-50 ${borderStyles}`}
				/>

				<button
					type="button"
					onClick={() => setShowPassword((prev) => !prev)}
					aria-label={showPassword ? "Hide password" : "Show password"}
					aria-pressed={showPassword}
					disabled={disabled}
					className="absolute right-3 text-[#72778f] hover:text-[#f8f9fc] transition-colors p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{showPassword ? (
						<EyeOff className="w-4 h-4" />
					) : (
						<Eye className="w-4 h-4" />
					)}
				</button>
			</div>

			{hasError && (
				<div
					id={`${inputId}-error`}
					className="flex items-start gap-1.5 mt-1.5 text-xs text-red-300 bg-red-950/30 border border-red-800/40 rounded px-2.5 py-1"
				>
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