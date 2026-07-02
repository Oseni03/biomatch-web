"use client";

import { Eyebrow } from "@/components/prospeo/eyebrow";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function Mission() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="mission"
			ref={ref}
			className={`w-full px-4 py-16 md:py-24 bg-background border-t border-border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="mx-auto max-w-4xl">
				<Eyebrow className="mb-4">OUR PURPOSE</Eyebrow>
				<h2 className="text-display-lg font-bold tracking-tight text-foreground">
					Making safe blood available when every second counts.
				</h2>
				<div className="mt-8 max-w-2xl space-y-6 text-body-md text-muted-foreground leading-relaxed">
					<p>
						BioMatch bridges the critical gap in emergency blood
						supply across Africa by connecting verified donors with
						hospitals in real time.
					</p>
					<p>
						Our mission is simple: eliminate preventable deaths
						caused by delayed access to compatible blood.
					</p>
				</div>
			</div>
		</section>
	);
}
