"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Join() {
	return (
		<motion.section
			id="join"
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
			className="border-t border-neutral-800 bg-neutral-950 px-4 py-16 md:py-24"
		>
			<div className="mx-auto max-w-xl text-center">
				<h2 className="text-3xl font-bold text-white md:text-4xl">
					Be the difference
				</h2>
				<p className="mt-4 text-base text-neutral-400">
					Join the network of donors and healthcare institutions
					transforming emergency care in Africa.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button
						size="lg"
						className="h-12 px-8 text-base font-semibold"
						asChild
					>
						<Link href="/auth/signup">Become a Donor</Link>
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="h-12 border-neutral-600 px-8 text-base font-semibold text-white hover:bg-neutral-800"
						asChild
					>
						<Link href="/auth/signup">Hospital Partnership</Link>
					</Button>
				</div>

				<p className="mt-10 text-xs text-neutral-500">
					Takes 60 seconds &bull; Verified &bull; Real impact
				</p>
			</div>
		</motion.section>
	);
}
