import type { LucideIcon } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionCardProps {
	icon: LucideIcon;
	title: string;
	collapsible?: boolean;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

export function SectionCard({
	icon: Icon,
	title,
	collapsible = false,
	defaultOpen = true,
	children,
}: SectionCardProps) {
	if (!collapsible) {
		return (
			<section className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-card-hover">
				<div className="flex items-center gap-2">
					<Icon className="h-4.5 w-4.5 text-brand" />
					<h2 className="text-sm font-semibold text-foreground">
						{title}
					</h2>
				</div>
				<div className="mt-4">{children}</div>
			</section>
		);
	}

	return (
		<Collapsible
			defaultOpen={defaultOpen}
			className="rounded-xl border border-border bg-card transition-shadow hover:shadow-card-hover"
		>
			<CollapsibleTrigger className="flex w-full items-center gap-2 px-6 py-4 text-left">
				<Icon className="h-4.5 w-4.5 text-brand" />
				<h2 className="text-sm font-semibold text-foreground">
					{title}
				</h2>
			</CollapsibleTrigger>
			<CollapsibleContent className="px-6 pb-4">
				{children}
			</CollapsibleContent>
		</Collapsible>
	);
}

export function SectionCardSkeleton() {
	return (
		<div className="rounded-xl border border-border bg-card p-6">
			<div className="flex items-center gap-2">
				<Skeleton className="h-4.5 w-4.5 rounded" />
				<Skeleton className="h-4 w-32" />
			</div>
			<div className="mt-4 space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		</div>
	);
}
