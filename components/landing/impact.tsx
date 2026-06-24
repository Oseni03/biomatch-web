"use client";

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
			className={`px-6 py-24 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-16">
					<div className="text-xs font-mono tracking-widest text-red-600 dark:text-red-500">
						IMPACT
					</div>
					<h2 className="text-4xl font-semibold tracking-tighter">
						Lives changed every day
					</h2>
				</div>

				<div className="space-y-16">
					{IMPACTS.map((item, i) => (
						<div key={i} className="flex gap-8 group">
							<div className="font-mono text-6xl font-semibold text-red-200 dark:text-red-800 flex-shrink-0 transition-all group-hover:text-red-300">
								{item.num}
							</div>
							<div>
								<div className="font-semibold text-2xl group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
									{item.title}
								</div>
								<p className="mt-4 text-gray-600 dark:text-zinc-400">
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
