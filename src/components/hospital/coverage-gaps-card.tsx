import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CoverageGap {
	group: string;
	count: number;
}

interface CoverageGapsCardProps {
	coverageGaps: CoverageGap[];
}

export function CoverageGapsCard({ coverageGaps }: CoverageGapsCardProps) {
	return (
		<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold">
					Coverage Gaps
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Blood groups with unfulfilled requests
				</CardDescription>
			</CardHeader>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{coverageGaps.map((gap) => (
					<div
						key={gap.group}
						className="bg-brand-light rounded-xl p-4 text-center"
					>
						<span className="text-xl font-bold font-mono text-brand block">
							{gap.group.replace("_", " ")}
						</span>
						<span className="text-xs text-muted-foreground">
							{gap.count} unfulfilled
						</span>
					</div>
				))}
			</div>
		</Card>
	);
}
