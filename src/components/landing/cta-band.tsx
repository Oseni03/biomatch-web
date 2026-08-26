"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { EASE_SMOOTH } from "@/lib/animations";

export function CtaBand() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-ink px-4 py-24 md:py-32">
			<motion.div
				aria-hidden
				animate={{ y: [0, -16, 0], rotate: [0, 10, 0] }}
				transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
				className="pointer-events-none absolute left-[12%] top-10 opacity-10"
			>
				<BloodDropIcon className="size-24 text-white" />
			</motion.div>
			<motion.div
				aria-hidden
				animate={{ y: [0, 14, 0] }}
				transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
				className="pointer-events-none absolute right-[10%] bottom-8 opacity-10"
			>
				<BloodDropIcon className="size-16 text-white" />
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.7, ease: EASE_SMOOTH }}
				className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
			>
				<h2 className="font-serif text-3xl font-medium leading-tight text-white md:text-5xl">
					Meet your next <span className="italic">donor.</span>
				</h2>
				<p className="mx-auto mt-4 max-w-md text-base text-white/75">
					Join thousands of verified donors or connect your hospital
					to Nigeria&rsquo;s real-time blood network today.
				</p>
				<div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
					<Button
						size="lg"
						className="h-12 rounded-full bg-white px-8 text-base font-semibold text-brand hover:bg-cream"
						asChild
					>
						<Link href="/auth/signup">
							Register as Donor
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button
						size="lg"
						className="h-12 rounded-full border border-white/40 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
						asChild
					>
						<Link href="/auth/login">Hospital Portal</Link>
					</Button>
				</div>
			</motion.div>
		</section>
	);
}
