"use client";

import Link from "next/link";
import { TrendingUp, Users, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const IMPACT_CARDS = [
	{
		icon: TrendingUp,
		stat: "2.3x",
		label: "Faster Response",
		description: "Average time to blood delivery reduced from 4 hours to 90 minutes"
	},
	{
		icon: Users,
		stat: "94%",
		label: "Donor Activation",
		description: "Active participation rate among registered donors responding to alerts"
	},
	{
		icon: Gauge,
		stat: "99.2%",
		label: "Match Accuracy",
		description: "AI-powered blood type compatibility matching with zero errors"
	}
];

export function Impact() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="impact"
			ref={ref}
			className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-slate-900 via-slate-950 to-black dark:from-slate-950 dark:via-slate-900 dark:to-black overflow-hidden"
		>
			{/* Animated Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
				<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,0,.1)_25%,rgba(255,0,0,.1)_50%,transparent_50%,transparent_75%,rgba(255,0,0,.1)_75%,rgba(255,0,0,.1))] bg-[length:60px_60px] animate-pulse opacity-5"></div>
			</div>

			<div className="relative max-w-6xl mx-auto">
				{/* Top Section */}
				<div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-4">Proven Results</p>
					<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
						Saving lives with precision and speed
					</h2>
					<p className="text-lg text-slate-300 max-w-2xl mx-auto">
						Our data shows measurable impact across every hospital we serve.
					</p>
				</div>

				{/* Impact Metrics */}
				<div className="grid md:grid-cols-3 gap-6 mb-16">
					{IMPACT_CARDS.map((card, i) => {
						const Icon = card.icon;
						return (
							<div
								key={i}
								className={`group relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl p-8 hover:from-white/15 hover:to-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10
									${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
									`}
								style={{
									transitionDelay: isVisible ? `${i * 100}ms` : "0ms"
								}}
							>
								{/* Background Glow */}
								<div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
									background: "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.1) 0%, transparent 70%)"
								}}></div>

								<div className="relative z-10">
									{/* Icon */}
									<Icon className="h-8 w-8 text-red-400 mb-6 group-hover:scale-110 group-hover:text-red-300 transition-all duration-300" />

									{/* Stat */}
									<div className="text-5xl font-bold text-white mb-2 font-black">
										{card.stat}
									</div>

									{/* Label */}
									<h3 className="text-lg font-semibold text-white mb-3">
										{card.label}
									</h3>

									{/* Description */}
									<p className="text-sm text-slate-300">
										{card.description}
									</p>
								</div>

								{/* Border Glow on Hover */}
								<div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
									background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, transparent 100%)"
								}}></div>
							</div>
						);
					})}
				</div>

				{/* CTA Section */}
				<div className={`text-center transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<div className="inline-block rounded-2xl bg-gradient-to-r from-white/5 to-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12 max-w-2xl mx-auto">
						<h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
							Ready to save lives?
						</h3>
						<p className="text-slate-300 mb-8">
							Join thousands of verified donors or connect your hospital to our network today.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button 
								size="lg" 
								className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/40"
								asChild
							>
								<Link href="/auth/signup">Register as Donor</Link>
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="border-white/30 text-white hover:bg-white/10 font-semibold"
								asChild
							>
								<Link href="/auth/login">Hospital Portal</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}