"use client";

import { MapPin, Users, Bell, Zap, Shield, BarChart3 } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FEATURES = [
	{
		icon: MapPin,
		title: "Instant Geolocation Matching",
		description: "Location-based search identifies compatible donors within minutes, wherever the emergency occurs.",
		gradient: "from-red-500 to-rose-500"
	},
	{
		icon: Users,
		title: "Verified Donor Network",
		description: "Pre-screened, trained volunteers ready to respond 24/7 to emergency blood requests.",
		gradient: "from-blue-500 to-cyan-500"
	},
	{
		icon: Bell,
		title: "Multi-Channel Alerts",
		description: "SMS and WhatsApp notifications mobilize donors instantly with hospital location and urgency level.",
		gradient: "from-emerald-500 to-teal-500"
	},
	{
		icon: Zap,
		title: "Real-Time Coordination",
		description: "Dashboard for hospitals to track donor responses, blood type availability, and ETA updates.",
		gradient: "from-amber-500 to-orange-500"
	},
	{
		icon: Shield,
		title: "Medical Compliance",
		description: "HIPAA-compliant infrastructure with secure health data handling and privacy protection.",
		gradient: "from-purple-500 to-pink-500"
	},
	{
		icon: BarChart3,
		title: "Impact Analytics",
		description: "Real-time dashboards showing lives saved, response times, and donor performance metrics.",
		gradient: "from-indigo-500 to-blue-500"
	},
];

export function Services() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="services"
			ref={ref}
			className="relative py-20 md:py-32 px-4 bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
		>
			{/* Decorative Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative max-w-6xl mx-auto">
				{/* Section Header */}
				<div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-4">Capabilities</p>
					<h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
						Everything hospitals and donors need
					</h2>
					<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
						From alert to donation, our platform handles every step of the emergency response.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{FEATURES.map((feature, i) => {
						const Icon = feature.icon;
						return (
							<div
								key={i}
								className={`group relative rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-8 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/30 dark:hover:shadow-slate-950/50 hover:-translate-y-1 cursor-default
									${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
									`}
								style={{
									transitionDelay: isVisible ? `${i * 100}ms` : "0ms"
								}}
							>
								{/* Icon Container */}
								<div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 mb-6`}></div>

								{/* Icon */}
								<Icon className={`h-7 w-7 text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`} />

								{/* Title */}
								<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
									{feature.title}
								</h3>

								{/* Description */}
								<p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
									{feature.description}
								</p>

								{/* Hover Border Accent */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
									style={{
										backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`
									}}
								></div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}