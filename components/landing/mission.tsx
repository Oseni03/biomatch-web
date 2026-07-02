"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { CheckCircle2 } from "lucide-react";

const BENEFITS = [
	"Instant location-based matching within minutes",
	"Verified, screened donor network",
	"Integration with major hospital systems",
	"24/7 emergency response coordination",
];

export function Mission() {
	const { ref, isVisible } = useScrollReveal();

	return (
		<section
			id="mission"
			ref={ref}
			className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
		>
			{/* Decorative Elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 -right-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative max-w-5xl mx-auto">
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					{/* Left Content */}
					<div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
						<div className="inline-block mb-6">
							<span className="text-sm font-semibold text-red-500 uppercase tracking-widest">Our Purpose</span>
						</div>

						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
							Every second counts in an emergency
						</h2>

						<p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
							BioMatch eliminates the delays that cost lives. By connecting verified donors with hospitals in real time, we ensure that compatible blood is available when every moment matters.
						</p>

						{/* Benefits List */}
						<div className="space-y-4">
							{BENEFITS.map((benefit, i) => (
								<div key={i} className="flex gap-3 items-start">
									<CheckCircle2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
									<span className="text-slate-700 dark:text-slate-200 font-medium">{benefit}</span>
								</div>
							))}
						</div>
					</div>

					{/* Right Visual */}
					<div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
						<div className="relative">
							{/* Card Stack Effect */}
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 transform translate-y-6 translate-x-6 blur opacity-50"></div>
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 transform translate-y-3 translate-x-3 blur opacity-75"></div>

							{/* Main Card */}
							<div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl">
								<div className="space-y-6">
									{/* Timeline Item 1 */}
									<div className="flex gap-4">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">1</div>
										</div>
										<div>
											<h4 className="font-semibold text-slate-900 dark:text-white mb-1">Hospital Alerts</h4>
											<p className="text-sm text-slate-600 dark:text-slate-400">Emergency request enters the network</p>
										</div>
									</div>

									{/* Timeline Item 2 */}
									<div className="flex gap-4">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">2</div>
										</div>
										<div>
											<h4 className="font-semibold text-slate-900 dark:text-white mb-1">Instant Matching</h4>
											<p className="text-sm text-slate-600 dark:text-slate-400">AI finds compatible donors in seconds</p>
										</div>
									</div>

									{/* Timeline Item 3 */}
									<div className="flex gap-4">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">3</div>
										</div>
										<div>
											<h4 className="font-semibold text-slate-900 dark:text-white mb-1">Response Mobilized</h4>
											<p className="text-sm text-slate-600 dark:text-slate-400">Donors receive SMS/WhatsApp notification</p>
										</div>
									</div>

									{/* Timeline Item 4 */}
									<div className="flex gap-4">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">4</div>
										</div>
										<div>
											<h4 className="font-semibold text-slate-900 dark:text-white mb-1">Life Saved</h4>
											<p className="text-sm text-slate-600 dark:text-slate-400">Blood donation reaches the hospital</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}