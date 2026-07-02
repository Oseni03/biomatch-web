import { cn } from "@/lib/utils";

const DEFAULT_LOGOS = [
	"Lagos State HMB",
	"Red Cross",
	"NISA",
	"NBTS",
	"MedAfrica",
	"LifeBank",
];

interface LogoBarProps {
	logos?: string[];
	className?: string;
}

export function LogoBar({ logos = DEFAULT_LOGOS, className }: LogoBarProps) {
	return (
		<div
			className={cn(
				"border-y border-border bg-secondary/30 py-8",
				className,
			)}
		>
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4">
				{logos.map((name) => (
					<span
						key={name}
						className="text-sm font-semibold tracking-wide text-muted-foreground/60"
					>
						{name}
					</span>
				))}
			</div>
		</div>
	);
}
