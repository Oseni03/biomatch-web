"use client";

import { Heart } from "lucide-react";

export function Footer() {
	return (
		<footer className="bg-zinc-950 text-zinc-400 py-20 px-6">
			<div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-12">
				<div>
					<div
						className="flex items-center gap-3 text-white text-2xl font-semibold mb-4 cursor-pointer"
						onClick={() =>
							window.scrollTo({ top: 0, behavior: "smooth" })
						}
					>
						<Heart className="h-6 w-6 text-red-500 fill-current" />{" "}
						BioMatch
					</div>
					<p className="max-w-xs">
						Digital blood network for Africa.
					</p>
				</div>

				<div className="grid grid-cols-3 gap-12 text-sm">
					<div>
						<div className="font-mono uppercase text-xs mb-4">
							Platform
						</div>
						<div className="space-y-3">
							<div>Donors</div>
							<div>Hospitals</div>
							<div>Alerts</div>
						</div>
					</div>
					<div>
						<div className="font-mono uppercase text-xs mb-4">
							Company
						</div>
						<div className="space-y-3">
							<div>Mission</div>
							<div>Impact</div>
							<div>Contact</div>
						</div>
					</div>
					<div>
						<div className="font-mono uppercase text-xs mb-4">
							Legal
						</div>
						<div className="space-y-3 text-xs">
							&copy; 2026 BioMatch
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
