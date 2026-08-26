import * as React from "react";
import { cn } from "@/lib/utils";

interface BloodDropIconProps extends React.SVGProps<SVGSVGElement> {
	filled?: boolean;
}

// The BioMatch mark — reused as logo glyph, list bullet, and button icon.
export function BloodDropIcon({
	className,
	filled = true,
	...props
}: BloodDropIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={cn("size-4", className)}
			fill={filled ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth={filled ? 0 : 1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M12 2c-3.5 5.5-7 10-7 13.5a7 7 0 0 0 14 0C19 12 15.5 7.5 12 2Z" />
		</svg>
	);
}
