"use client";

import { motion } from "framer-motion";
import { Hospital, Landmark, Stethoscope, Droplets } from "lucide-react";
import { EASE_SMOOTH } from "@/lib/animations";

const CATEGORIES = [
	{
		icon: Hospital,
		label: "Teaching Hospitals",
	},
	{
		icon: Landmark,
		label: "State & Regional Hospitals",
	},
	{
		icon: Stethoscope,
		label: "Private Clinics",
	},
	{
		icon: Droplets,
		label: "Blood Banks",
	},
];

export function Partners() {
	return (
		<section id="partners" className="bg-background px-4 py-20 md:py-28">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: EASE_SMOOTH }}
					className="mb-14 text-center"
				>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
						Our Partners
					</p>
					<h2 className="font-serif text-3xl font-medium text-foreground md:text-4xl">
						Built for hospitals across Nigeria
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
						From teaching hospitals to regional blood banks, BioMatch
						is designed to keep inventory current and emergencies
						covered.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 0.15 }}
					className="grid grid-cols-2 gap-4 md:grid-cols-4"
				>
					{CATEGORIES.map(({ icon: Icon, label }) => (
						<div
							key={label}
							className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center shadow-card"
						>
							<div className="flex size-11 items-center justify-center rounded-full bg-brand-light text-brand">
								<Icon className="size-5" />
							</div>
							<p className="text-sm font-medium text-foreground">
								{label}
							</p>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
