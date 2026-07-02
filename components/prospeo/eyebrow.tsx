import { cn } from "@/lib/utils";

interface EyebrowProps {
	children: React.ReactNode;
	className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
	return (
		<span
			className={cn(
				"inline-block rounded-full border border-brand/15 bg-brand/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand",
				className,
			)}
		>
			{children}
		</span>
	);
}
