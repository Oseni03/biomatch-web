"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { EASE_SMOOTH } from "@/lib/animations";

// Illustrative partner names (fictional placeholders — city + generic
// hospital type), not real institutions. Swap for real logos once BioMatch
// has signed hospital partners.
const PARTNERS = [
	"Lagos General Hospital",
	"Abuja Central Clinic",
	"Port Harcourt Medical Centre",
	"Kano Regional Hospital",
	"Ibadan Teaching Hospital",
	"Enugu General Hospital",
	"Kaduna State Hospital",
	"Benin City Medical Centre",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
	const items = [...PARTNERS, ...PARTNERS];
	return (
		<div className="flex overflow-hidden">
			<motion.div
				animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
				transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
				className="flex shrink-0 items-center gap-4 pr-4"
			>
				{items.map((name, i) => (
					<div
						key={`${name}-${i}`}
						className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-card transition-colors hover:border-brand/30 hover:text-brand"
					>
						<Building2 className="size-4" />
						{name}
					</div>
				))}
			</motion.div>
		</div>
	);
}

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
						Trusted by hospitals across Nigeria
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
						From teaching hospitals to regional blood banks, partner
						institutions rely on BioMatch to keep inventory current
						and emergencies covered.
					</p>
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="space-y-4"
				style={{
					maskImage:
						"linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
					WebkitMaskImage:
						"linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
				}}
			>
				<MarqueeRow />
				<MarqueeRow reverse />
			</motion.div>
		</section>
	);
}
