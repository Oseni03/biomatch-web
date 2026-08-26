import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wordmarkVariants = cva("font-serif font-black tracking-tight", {
	variants: {
		size: {
			sm: "text-base",
			md: "text-xl",
			lg: "text-2xl",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface WordmarkProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof wordmarkVariants> {}

export function Wordmark({ size, className, ...props }: WordmarkProps) {
	return (
		<span className={cn(wordmarkVariants({ size }), className)} {...props}>
			BioMatch
		</span>
	);
}
