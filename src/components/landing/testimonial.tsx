"use client";

import { motion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/animations";

export function Testimonial() {
	return (
		<section className="bg-paper px-4 py-16 md:py-20">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, ease: EASE_SMOOTH }}
				className="mx-auto flex max-w-xl flex-col items-center text-center"
			>
				<div className="flex size-11 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
					AO
				</div>
				<p className="mt-6 font-serif text-xl italic leading-relaxed text-foreground md:text-2xl">
					&ldquo;BioMatch cut our emergency blood request time from
					hours to minutes. It&rsquo;s the difference between waiting
					and saving a life.&rdquo;
				</p>
				<p className="mt-4 text-sm text-muted-foreground">
					Dr. Adaeze O. &middot; Emergency Physician, Lagos
				</p>
			</motion.div>
		</section>
	);
}
