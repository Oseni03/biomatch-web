"use client";

import { motion } from "framer-motion";
import { Send, Users } from "lucide-react";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { EASE_SMOOTH } from "@/lib/animations";

const bubbleVariants = {
	hidden: { opacity: 0, y: 12, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: EASE_SMOOTH },
	},
};

// Product mockup for the marketing hero — a chat-style rendering of the
// donor emergency-alert flow, echoing the Orchid reference's phone screenshot.
export function PhoneMockup() {
	return (
		<div className="relative mx-auto w-[300px] rounded-[2.75rem] border-[10px] border-ink bg-ink p-1.5 shadow-2xl md:w-[320px]">
			<div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
			<div className="flex h-[560px] flex-col overflow-hidden rounded-[2rem] bg-paper">
				<div className="flex items-center gap-2 border-b border-border bg-card px-5 pb-3 pt-8">
					<div className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
						<BloodDropIcon className="size-3.5" />
					</div>
					<div>
						<p className="text-xs font-bold leading-none text-foreground">
							BioMatch
						</p>
						<p className="mt-0.5 flex items-center gap-1 text-[10px] text-status-ok">
							<span className="size-1.5 rounded-full bg-status-ok" />
							Matching now
						</p>
					</div>
				</div>

				<div className="flex-1 space-y-3 overflow-hidden px-4 py-5">
					<motion.div
						variants={bubbleVariants}
						initial="hidden"
						animate="visible"
						className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-sm text-white"
					>
						O- needed, 2 units. Lagos General, 8 min away.
					</motion.div>

					<motion.div
						variants={bubbleVariants}
						initial="hidden"
						animate="visible"
						transition={{ delay: 0.35 }}
						className="max-w-[90%] space-y-3 rounded-2xl rounded-tl-md border border-border bg-card p-3.5 shadow-card"
					>
						<div className="flex items-center gap-2.5">
							<BloodTypeBadge bloodGroup="O_MINUS" size="sm" />
							<div className="min-w-0">
								<p className="truncate text-xs font-bold text-foreground">
									Lagos General Hospital
								</p>
								<p className="text-[11px] text-muted-foreground">
									1.8 km &middot; Critical
								</p>
							</div>
						</div>
						<div className="h-px bg-border" />
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
							className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
						>
							<Users className="size-3" />
							<span className="num font-semibold text-foreground">
								3 donors
							</span>
							notified &middot; ~8.7s avg response
						</motion.div>
					</motion.div>

					<motion.div
						variants={bubbleVariants}
						initial="hidden"
						animate="visible"
						transition={{ delay: 1.05 }}
						className="ml-auto max-w-[70%] rounded-2xl rounded-tr-md bg-status-ok px-4 py-2.5 text-sm font-medium text-white"
					>
						On my way.
					</motion.div>
				</div>

				<div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3">
					<div className="flex-1 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
						Message
					</div>
					<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
						<Send className="size-3.5" />
					</div>
				</div>
			</div>
		</div>
	);
}
