"use client";

import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/prospeo/eyebrow";
import { BlobDecoration } from "@/components/prospeo/blob-decoration";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-background px-4 pt-24 pb-16 text-center">
			<BlobDecoration />

			<div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
				<Star className="h-3 w-3 fill-brand text-brand" />
				<span>4.8 &middot; 400+ responses</span>
			</div>

			<h1 className="text-display-xl mx-auto max-w-2xl font-bold tracking-tight text-foreground">
				Blood. Matched. In minutes.
			</h1>

			<p className="mx-auto mt-4 max-w-md text-body-md text-muted-foreground">
				Connecting verified donors with hospitals across Africa through instant, location-aware matching.
			</p>

			<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" asChild>
					<Link href="/auth/signup">
						Register as Donor
						<ChevronRight className="group-hover:translate-x-1 transition-transform" />
					</Link>
				</Button>
				<Button variant="secondary" size="lg" asChild>
					<Link href="/auth/login">Hospital Portal</Link>
				</Button>
			</div>
		</section>
	);
}
