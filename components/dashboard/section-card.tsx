import type { LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
			<section className="rounded-xl border border-gray-200 bg-white p-6">
				<div className="flex items-center gap-2">
					<Icon className="h-4.5 w-4.5 text-rose-600" />
					<h2 className="text-sm font-semibold text-gray-900">{title}</h2>
				</div>
				<div className="mt-4">{children}</div>
			</section>
		);
	}

	return (
		<Collapsible
			defaultOpen={defaultOpen}
			className="rounded-xl border border-gray-200 bg-white"
		>
			<CollapsibleTrigger className="flex w-full items-center gap-2 px-6 py-4 text-left">
				<Icon className="h-4.5 w-4.5 text-rose-600" />
				<h2 className="text-sm font-semibold text-gray-900">{title}</h2>
			</CollapsibleTrigger>
			<CollapsibleContent className="px-6 pb-4">
				{children}
			</CollapsibleContent>
		</Collapsible>
	);
}
