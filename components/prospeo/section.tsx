import { cn } from "@/lib/utils";

interface SectionProps {
	children: React.ReactNode;
	dark?: boolean;
	className?: string;
	id?: string;
}

export function Section({ children, dark, className, id }: SectionProps) {
	return (
		<section
			id={id}
			className={cn(
				"w-full px-4 py-16 md:py-24",
				dark ? "bg-dark-bg text-white" : "bg-background",
				className,
			)}
		>
			<div className="mx-auto max-w-6xl">{children}</div>
		</section>
	);
}
