import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

const bloodTypeBadgeVariants = cva(
	"inline-flex shrink-0 items-center justify-center rounded-2xl border font-mono font-bold tracking-tight",
	{
		variants: {
			variant: {
				default: "bg-brand-light text-brand border-brand/20",
				deep: "bg-brand text-primary-foreground border-transparent shadow-brand",
				onRed: "bg-white/15 text-white border-white/25",
			},
			size: {
				sm: "h-8 w-8 text-xs",
				md: "h-11 w-11 text-sm",
				lg: "h-14 w-14 text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

interface BloodTypeBadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof bloodTypeBadgeVariants> {
	bloodGroup: string;
	showIcon?: boolean;
}

// Droplet-shaped chip for a blood group, e.g. O-, A+, AB-.
export function BloodTypeBadge({
	bloodGroup,
	variant,
	size,
	showIcon = false,
	className,
	...props
}: BloodTypeBadgeProps) {
	return (
		<div
			className={cn(bloodTypeBadgeVariants({ variant, size }), className)}
			{...props}
		>
			{showIcon ? (
				<BloodDropIcon className="size-3.5" />
			) : (
				formatBloodGroup(bloodGroup)
			)}
		</div>
	);
}
