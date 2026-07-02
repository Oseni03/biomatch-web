"use client";

import { Heart, Building, Clock, Users } from "lucide-react";

const STATS = [
	{ 
		value: "14,210", 
		label: "Lives Saved", 
		icon: Heart,
		gradient: "from-red-500 to-rose-500"
	},
	{ 
		value: "3,847", 
		label: "Verified Donors", 
		icon: Users,
		gradient: "from-blue-500 to-cyan-500"
	},
	{ 
		value: "92", 
		label: "Partner Hospitals", 
		icon: Building,
		gradient: "from-emerald-500 to-teal-500"
	},
	{ 
		value: "8.7s", 
		label: "Avg Response", 
		icon: Clock,
		gradient: "from-amber-500 to-orange-500"
	},
];

export function Stats() {
	return (
		<section className="relative py-20 md:py-28 px-4 bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50">
			<div className="max-w-6xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-16">
					<p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-4">Real Impact</p>
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
						Trusted by hospitals and donors across Africa
					</h2>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{STATS.map((stat, i) => {
						const Icon = stat.icon;
						return (
							<div 
								key={i} 
								className="group relative rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-8 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-950"
							>
								{/* Icon Background */}
								<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 mb-6`}></div>
								
								{/* Icon */}
								<Icon className={`h-6 w-6 text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`} />

								{/* Value */}
								<div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
									{stat.value}
								</div>

								{/* Label */}
								<div className="text-sm font-medium text-slate-600 dark:text-slate-400">
									{stat.label}
								</div>

								{/* Animated Border */}
								<div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
									style={{
										background: `linear-gradient(135deg, var(--color-stop, transparent) 0%, transparent 100%)`,
										padding: '1px'
									}}
								></div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}