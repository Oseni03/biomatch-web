import { cn } from "@/lib/utils";

interface StatBlockProps {
	value: string;
	label: string;
	icon?: React.ReactNode;
	className?: string;
}

export function StatBlock({ value, label, icon, className }: StatBlockProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-2xl border border-border bg-secondary/50 px-6 py-5",
				className,
			)}
		>
			{icon && (
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
					{icon}
				</div>
			)}
			<div>
				<p className="text-stat font-bold tracking-tight text-foreground">
					{value}
				</p>
				<p className="text-sm text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}
