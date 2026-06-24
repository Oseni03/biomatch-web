"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function Mission() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="mission"
			ref={ref}
			className={`px-6 py-24 border-t border-gray-100 dark:border-zinc-800 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="max-w-4xl mx-auto">
				<div className="uppercase text-red-600 dark:text-red-500 text-xs font-mono tracking-widest mb-3">
					OUR PURPOSE
				</div>
				<h2 className="text-5xl font-semibold tracking-tighter leading-snug">
					Making safe blood available when every second counts.
				</h2>

				<div className="mt-12 max-w-2xl text-lg text-gray-600 dark:text-zinc-400 space-y-8">
					<p>
						BIO MATCH bridges the critical gap in emergency blood
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
