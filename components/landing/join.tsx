"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function Join() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="join"
			ref={ref}
			className={`border-t border-gray-100 dark:border-zinc-800 px-6 py-24 bg-white dark:bg-zinc-950 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="max-w-xl mx-auto text-center">
				<h2 className="text-5xl font-semibold tracking-tighter">
					Be the difference
				</h2>
				<p className="mt-6 text-xl text-gray-600 dark:text-zinc-400">
					Join the network of donors and healthcare institutions
					transforming emergency care in Africa.
				</p>

				<div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-3xl text-lg transition-all duration-300 hover:scale-105 active:scale-95"
						asChild
					>
						<Link href="/auth/signup">Become a Donor</Link>
					</Button>
					<Button
						variant="outline"
						className="px-10 py-4 rounded-3xl text-lg border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all duration-300 hover:scale-105"
						asChild
					>
						<Link href="/auth/signup">Hospital Partnership</Link>
					</Button>
				</div>

				<p className="text-xs text-gray-400 dark:text-zinc-500 mt-10">
					Takes 60 seconds &bull; Verified &bull; Real impact
				</p>
			</div>
		</section>
	);
}
