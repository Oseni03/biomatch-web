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
			className={`w-full px-4 py-16 md:py-24 bg-dark-bg text-white border-t border-dark-border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
		>
			<div className="mx-auto max-w-xl text-center">
				<h2 className="text-display-lg font-bold tracking-tight">
					Be the difference
				</h2>
				<p className="mt-4 text-body-md text-muted-foreground">
					Join the network of donors and healthcare institutions
					transforming emergency care in Africa.
				</p>

				<div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
					<Button
						className="bg-white text-dark-bg hover:bg-white/90 shadow-brand"
						asChild
					>
						<Link href="/auth/signup">Become a Donor</Link>
					</Button>
					<Button
						variant="outline"
						className="border-dark-border text-white hover:bg-dark-surface"
						asChild
					>
						<Link href="/auth/signup">Hospital Partnership</Link>
					</Button>
				</div>

				<p className="text-xs text-muted-foreground/60 mt-10">
					Takes 60 seconds &bull; Verified &bull; Real impact
				</p>
			</div>
		</section>
	);
}
