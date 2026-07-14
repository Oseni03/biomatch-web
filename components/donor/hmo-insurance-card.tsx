"use client";

import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HmoInsuranceCardProps {
	userName: string;
	userId: string;
	completedCount: number;
	hmoTier: {
		name: string;
		level: number;
		desc: string;
	};
}

export function HmoInsuranceCard({
	userName,
	userId,
	completedCount,
	hmoTier,
}: HmoInsuranceCardProps) {
	return (
		<Card className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-xl p-6 relative overflow-hidden shadow-xl border border-zinc-800 transition-shadow hover:shadow-card-hover">
			<div className="absolute right-0 bottom-0 w-36 h-36 bg-brand/10 rounded-full blur-2xl pointer-events-none" />

			<div className="flex justify-between items-start mb-8">
				<div>
					<span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-mono tracking-widest uppercase text-brand-muted border border-white/5">
						BioMatch Insurance Hub
					</span>
					<h3 className="text-sm font-bold tracking-tight text-white/90 mt-2.5">
						Reliance Health HMO
					</h3>
				</div>
				<Shield className="h-6 w-6 text-brand fill-current" />
			</div>

			<div className="space-y-4 mb-6 relative">
				<div>
					<span className="text-[10px] text-zinc-400 font-mono block">
						PLAN OWNER
					</span>
					<span className="text-sm font-semibold tracking-tight text-white font-mono uppercase">
						{userName}
					</span>
				</div>
				<div className="flex justify-between">
					<div>
						<span className="text-[10px] text-zinc-400 font-mono block">
							COVERAGE STATUS
						</span>
						<span
							className={`text-xs font-semibold ${completedCount > 0 ? "text-green-400" : "text-yellow-400"}`}
						>
							{hmoTier.name}
						</span>
					</div>
					<div className="text-right">
						<span className="text-[10px] text-zinc-400 font-mono block">
							MEMBER ID
						</span>
						<span className="text-xs font-semibold font-mono text-white/80">
							BM-HMO-
							{(userId ?? "0000").substring(0, 6).toUpperCase()}
						</span>
					</div>
				</div>
			</div>

			<div className="pt-4 border-t border-white/10 text-xs">
				<div className="flex justify-between text-[10px] text-zinc-400 mb-2">
					<span>MILESTONE PROGRESS</span>
					<span>{completedCount} / 3 Donations</span>
				</div>

				<div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-brand to-green-400 rounded-full transition-all duration-500"
						style={{
							width: `${Math.min(100, (completedCount / 3) * 100)}%`,
						}}
					/>
				</div>

				<p className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
					{hmoTier.desc}
				</p>
			</div>
		</Card>
	);
}
