"use client";

import { Heart } from "lucide-react";

export function Footer() {
	return (
		<footer className="bg-dark-bg text-muted-foreground py-20 px-6 border-t border-dark-border">
			<div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between gap-12">
				<div>
					<div
						className="flex items-center gap-3 text-white text-2xl font-semibold mb-4 cursor-pointer"
						onClick={() =>
							window.scrollTo({ top: 0, behavior: "smooth" })
						}
					>
						<Heart className="h-6 w-6 text-brand fill-current" />
						BioMatch
					</div>
					<p className="max-w-xs text-sm">
						Digital blood network for Africa.
					</p>
				</div>

				<div className="grid grid-cols-3 gap-12 text-sm">
					<div>
						<div className="font-semibold text-white text-xs uppercase tracking-widest mb-4">
							Platform
						</div>
						<div className="space-y-3">
							<div className="hover:text-white transition-colors cursor-pointer">Donors</div>
							<div className="hover:text-white transition-colors cursor-pointer">Hospitals</div>
							<div className="hover:text-white transition-colors cursor-pointer">Alerts</div>
						</div>
					</div>
					<div>
						<div className="font-semibold text-white text-xs uppercase tracking-widest mb-4">
							Company
						</div>
						<div className="space-y-3">
							<div className="hover:text-white transition-colors cursor-pointer">Mission</div>
							<div className="hover:text-white transition-colors cursor-pointer">Impact</div>
							<div className="hover:text-white transition-colors cursor-pointer">Contact</div>
						</div>
					</div>
					<div>
						<div className="font-semibold text-white text-xs uppercase tracking-widest mb-4">
							Legal
						</div>
						<div className="space-y-3">
							<div className="text-xs">&copy; 2026 BioMatch</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
