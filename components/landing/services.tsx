"use client";

import { MapPin, Users, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const SERVICES = [
	{
		icon: MapPin,
		title: "Instant Matching",
		desc: "Location-based search finds compatible donors within minutes.",
	},
	{
		icon: Users,
		title: "Donor Network",
		desc: "Verified voluntary donors ready to respond to emergencies.",
	},
	{
		icon: Bell,
		title: "Emergency Alerts",
		desc: "SMS and WhatsApp notifications mobilize the community instantly.",
	},
];

export function Services() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="services"
			ref={ref}
			className={`bg-gray-50 dark:bg-zinc-900 px-6 py-24 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-16">
					<div className="text-xs font-mono tracking-widest text-red-600 dark:text-red-500">
						CAPABILITIES
					</div>
					<h2 className="text-4xl font-semibold tracking-tighter mt-3">
						How BioMatch Works
					</h2>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{SERVICES.map((service, i) => {
						const Icon = service.icon;
						return (
							<Card
								key={i}
								className="border border-gray-100 dark:border-zinc-800 rounded-3xl group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white dark:bg-zinc-950"
								style={{ animationDelay: `${i * 150}ms` }}
							>
								<CardContent className="p-10">
									<Icon className="h-8 w-8 text-red-600 mb-6 transition-transform group-hover:scale-110" />
									<h3 className="text-2xl font-semibold mb-3">
										{service.title}
									</h3>
									<p className="text-gray-600 dark:text-zinc-400">
										{service.desc}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
