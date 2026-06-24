const STATS = [
	{ num: "14,210", label: "Lives Saved" },
	{ num: "3,847", label: "Verified Donors" },
	{ num: "92", label: "Partner Hospitals" },
	{ num: "8.7s", label: "Avg Response" },
];

export function Stats() {
	return (
		<div className="max-w-5xl mx-auto px-6 pb-20">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-10">
				{STATS.map((stat, i) => (
					<div
						key={i}
						className="text-center group transition-all duration-500 hover:-translate-y-1"
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<div className="text-4xl font-mono font-semibold tracking-tighter text-red-600 dark:text-red-500 group-hover:scale-110 transition-transform">
							{stat.num}
						</div>
						<div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
							{stat.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
