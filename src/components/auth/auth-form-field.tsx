"use client";

import { useState } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFormFieldProps {
	label: string;
	icon?: "mail" | "lock" | "phone";
	type?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "className">;
}

export function AuthFormField({
	label,
	icon,
	type = "text",
	value,
	onChange,
	placeholder,
	error,
	required,
	disabled,
	className,
	inputProps,
}: AuthFormFieldProps) {
	const IconComponent = icon === "mail" ? Mail : icon === "lock" ? Lock : icon === "phone" ? Phone : null;
	const showPasswordToggle = type === "password" && !disabled;
	const [visible, setVisible] = useState(false);

	const inputType = showPasswordToggle ? (visible ? "text" : "password") : type;

	return (
		<div className={cn("space-y-2", className)}>
			<label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
				{label}
				{required && <span className="text-brand ml-1">*</span>}
			</label>
			<div className="relative">
				{IconComponent && !disabled && (
					<span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
						<IconComponent className="h-4 w-4" />
					</span>
				)}
				<input
					type={inputType}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					className={cn(
						"w-full rounded-2xl border-border bg-muted py-3 text-sm transition-all",
						"focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring",
						IconComponent && !disabled ? "pl-10" : "px-4",
						showPasswordToggle ? "pr-12" : "pr-4",
						disabled && "opacity-60 cursor-not-allowed",
						error && "border-brand/40",
					)}
					{...inputProps}
				/>
				{showPasswordToggle && (
					<button
						type="button"
						onClick={() => setVisible(!visible)}
						className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
					>
						{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				)}
			</div>
			{error && <p className="text-xs text-brand">{error}</p>}
		</div>
	);
}
