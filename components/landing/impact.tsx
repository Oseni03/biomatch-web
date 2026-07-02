"use client";

import { Eyebrow } from "@/components/prospeo/eyebrow";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const IMPACTS = [
	{
		num: "01",
		title: "Rapid Response",
		desc: "Compatible donors notified within seconds of hospital requests.",
	},
	{
		num: "02",
		title: "Trusted Community",
		desc: "Thousands of verified donors building a resilient blood network.",
	},
];

export function Impact() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="impact"
			ref={ref}
			className={`w-full px-4 py-16 md:py-24 bg-background border-t border-border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="mx-auto max-w-4xl">
				<div className="text-center mb-12">
					<Eyebrow className="mb-3">IMPACT</Eyebrow>
					<h2 className="text-display-lg font-bold tracking-tight text-foreground">
						Lives changed every day
					</h2>
				</div>

				<div className="space-y-16">
					{IMPACTS.map((item, i) => (
						<div key={i} className="flex gap-8 group">
							<div className="font-mono text-6xl font-semibold text-brand/30 flex-shrink-0 transition-all group-hover:text-brand/40">
								{item.num}
							</div>
							<div>
								<div className="font-semibold text-heading-lg text-foreground group-hover:text-brand transition-colors">
									{item.title}
								</div>
								<p className="mt-4 text-body-md text-muted-foreground">
									{item.desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
