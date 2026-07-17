"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Bell, Zap, Shield, BarChart3 } from "lucide-react";

const FEATURES = [
	{
		icon: MapPin,
		title: "Instant Geolocation Matching",
		description:
			"Location-based search identifies compatible donors within minutes, wherever the emergency occurs.",
	},
	{
		icon: Users,
		title: "Verified Donor Network",
		description:
			"Pre-screened, trained volunteers ready to respond 24/7 to emergency blood requests.",
	},
	{
		icon: Bell,
		title: "Multi-Channel Alerts",
		description:
			"SMS and WhatsApp notifications mobilize donors instantly with hospital location and urgency level.",
	},
	{
		icon: Zap,
		title: "Real-Time Coordination",
		description:
			"Dashboard for hospitals to track donor responses, blood type availability, and ETA updates.",
	},
	{
		icon: Shield,
		title: "Medical Compliance",
		description:
			"HIPAA-compliant infrastructure with secure health data handling and privacy protection.",
	},
	{
		icon: BarChart3,
		title: "Impact Analytics",
		description:
			"Real-time dashboards showing lives saved, response times, and donor performance metrics.",
	},
];

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" as const },
	},
};

export function Services() {
	return (
		<section
			id="services"
			className="border-t border-border bg-background px-4 py-20 md:py-28"
		>
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-14 text-center"
				>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
						Capabilities
					</p>
					<h2 className="text-3xl font-bold text-foreground md:text-4xl">
						Everything hospitals and donors need
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
						From alert to donation, our platform handles every step
						of the emergency response.
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
				>
					{FEATURES.map((feature, i) => {
						const Icon = feature.icon;
						return (
							<motion.div
								key={i}
								variants={cardVariants}
								className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-card transition-shadow hover:shadow-card-hover"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="mb-2 text-lg font-semibold text-foreground">
										{feature.title}
									</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{feature.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
