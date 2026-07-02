"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 px-4 pt-32 pb-24">
			{/* Animated background gradient */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative max-w-4xl mx-auto text-center">
				{/* Subheading */}
				<div className="inline-flex items-center gap-2 rounded-full border border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-4 py-2 mb-8 backdrop-blur-sm">
					<Zap className="h-4 w-4 text-red-500" />
					<span className="text-sm font-medium text-red-700 dark:text-red-300">
						Emergency matching at scale
					</span>
				</div>

				{/* Main Headline */}
				<h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white mb-6 leading-[1.1]">
					Blood matched in
					<span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">
						minutes, not hours
					</span>
				</h1>

				{/* Subtext */}
				<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
					Connect verified donors with hospitals across Africa in real time. Every second counts when lives are on the line.
				</p>

				{/* CTA Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
					<Button 
						size="lg" 
						className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-xl shadow-red-500/30 h-12 px-8 text-base"
						asChild
					>
						<Link href="/auth/signup">
							Register as Donor
							<ArrowRight className="h-5 w-5 ml-2" />
						</Link>
					</Button>
					<Button 
						variant="outline" 
						size="lg" 
						className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold h-12 px-8 text-base hover:border-slate-300 dark:hover:border-slate-600"
						asChild
					>
						<Link href="/auth/login">Hospital Portal</Link>
					</Button>
				</div>

				{/* Visual Stats Bar */}
				<div className="grid grid-cols-3 gap-6 md:gap-8 max-w-xl mx-auto">
					<div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur">
						<div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">8.7s</div>
						<div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Avg Response</div>
					</div>
					<div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur">
						<div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">14K+</div>
						<div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Lives Saved</div>
					</div>
					<div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur">
						<div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">92</div>
						<div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Hospitals</div>
					</div>
				</div>
			</div>
		</section>
	);
}