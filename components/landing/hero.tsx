"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
	return (
		<section className="pt-24 pb-20 px-6 relative overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(#ef444420_0.8px,transparent_1px)] dark:bg-[radial-gradient(#ef444410_0.8px,transparent_1px)] bg-[length:4px_4px]" />

			<div className="max-w-3xl mx-auto text-center relative">
				<Badge
					variant="outline"
					className="inline-flex px-4 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-mono tracking-widest rounded-full mb-8 border-0 animate-fade-in"
				>
					REAL-TIME BLOOD NETWORK &bull; LAGOS
				</Badge>

				<h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none mb-8 animate-fade-in-up">
					Blood. Matched.
					<br />
					In minutes.
				</h1>

				<p
					className="text-xl text-gray-600 dark:text-zinc-400 max-w-md mx-auto animate-fade-in-up"
					style={{ animationDelay: "300ms" }}
				>
					Connecting verified donors with hospitals across Africa
					through instant, location-aware matching.
				</p>

				<div
					className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-fade-in-up"
					style={{ animationDelay: "500ms" }}
				>
					<Button
						className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-3xl text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
						asChild
					>
						<Link href="/auth/signup">
							Register as Donor
							<ChevronRight className="group-hover:translate-x-1 transition-transform" />
						</Link>
					</Button>
					<Button
						variant="outline"
						className="px-8 py-4 rounded-3xl text-lg border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all duration-300 hover:scale-105"
						asChild
					>
						<Link href="/auth/login">Hospital Portal</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
