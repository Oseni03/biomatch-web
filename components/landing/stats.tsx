"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Building, Droplets, Users, Activity } from "lucide-react";

const STATS = [
	{ end: 12450, suffix: "+", label: "Active Donors", icon: Users },
	{ end: 92, suffix: "", label: "Partner Hospitals", icon: Building },
	{ end: 3847, suffix: "", label: "Blood Requests", icon: Droplets },
	{ end: 14210, suffix: "+", label: "Lives Saved", icon: Heart },
	{ end: 8640, suffix: "+", label: "Available Units", icon: Activity },
];

function AnimatedCounter({
	end,
	suffix = "",
}: {
	end: number;
	suffix?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true });
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!isInView) return;
		let current = 0;
		const duration = 2000;
		const step = Math.max(1, Math.ceil(end / (duration / 16)));
		const timer = setInterval(() => {
			current += step;
			if (current >= end) {
				setCount(end);
				clearInterval(timer);
			} else {
				setCount(current);
			}
		}, 16);
		return () => clearInterval(timer);
	}, [isInView, end]);

	return (
		<span ref={ref}>
			{count.toLocaleString()}
			{suffix}
		</span>
	);
}

const cardVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0 },
};

export function Stats() {
	return (
		<section id="stats" className="bg-background px-4 py-20 md:py-28">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-14 text-center"
				>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
						Real Impact
					</p>
					<h2 className="text-3xl font-bold text-foreground md:text-4xl">
						Trusted across Africa
					</h2>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					transition={{ staggerChildren: 0.1 }}
					className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5"
				>
					{STATS.map((stat) => {
						const Icon = stat.icon;
						return (
							<motion.div
								key={stat.label}
								variants={cardVariants}
								transition={{ duration: 0.4, ease: "easeOut" }}
								className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-card"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
									<Icon className="h-5 w-5" />
								</div>
								<div className="text-3xl font-black text-foreground md:text-4xl">
									<AnimatedCounter
										end={stat.end}
										suffix={stat.suffix}
									/>
								</div>
								<div className="text-sm text-muted-foreground">
									{stat.label}
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
