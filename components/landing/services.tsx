"use client";

import { MapPin, Users, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/prospeo/eyebrow";
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
			className={`w-full px-4 py-16 md:py-24 bg-secondary/50 border-t border-border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="mx-auto max-w-5xl">
				<div className="text-center mb-12">
					<Eyebrow className="mb-3">CAPABILITIES</Eyebrow>
					<h2 className="text-display-lg font-bold tracking-tight text-foreground">
						How BioMatch Works
					</h2>
					<p className="mt-3 text-body-md text-muted-foreground max-w-md mx-auto">
						From alert to donation in record time.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{SERVICES.map((service, i) => {
						const Icon = service.icon;
						return (
							<Card key={i} className="p-8 text-center">
								<Icon className="h-8 w-8 text-brand mb-6 mx-auto" />
								<h3 className="text-heading-md font-semibold text-foreground mb-3">
									{service.title}
								</h3>
								<p className="text-body-md text-muted-foreground">
									{service.desc}
								</p>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
