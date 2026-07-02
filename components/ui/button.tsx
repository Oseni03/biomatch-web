import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-brand text-white shadow-brand hover:bg-brand-hover hover:scale-[1.01] active:scale-[0.99]",
				secondary:
					"bg-white text-foreground border border-border hover:bg-secondary",
				destructive:
					"bg-destructive/10 text-destructive hover:bg-destructive/20",
				ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
				link: "text-muted-foreground underline-offset-4 hover:underline hover:text-foreground",
				outline:
					"border border-input bg-background text-foreground hover:bg-secondary",
			},
			size: {
				default: "h-9 px-5 py-2",
				sm: "h-8 px-4 text-xs",
				lg: "h-11 px-7 text-base",
				icon: "h-9 w-9",
				"icon-sm": "size-7 rounded-[10px]",
				"icon-xs":
					"size-6 rounded-[10px] text-xs [&_svg:not([class*='size-'])]:size-3",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
