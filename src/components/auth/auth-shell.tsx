"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { EASE_SMOOTH } from "@/lib/animations";

interface AuthStat {
	value: string;
	label: string;
}

interface AuthShellProps {
	eyebrow: string;
	headline: ReactNode;
	description: string;
	stats: AuthStat[];
	children: ReactNode;
}

export function AuthShell({
	eyebrow,
	headline,
	description,
	stats,
	children,
}: AuthShellProps) {
	return (
		<div className="grid min-h-screen w-full bg-paper lg:grid-cols-2">
			<div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
				<motion.div
					aria-hidden
					animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					className="pointer-events-none absolute right-[12%] top-20 text-brand/10"
				>
					<BloodDropIcon className="size-24" />
				</motion.div>
				<motion.div
					aria-hidden
					animate={{ y: [0, 10, 0] }}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 0.4,
					}}
					className="pointer-events-none absolute left-[10%] bottom-36 text-brand/10"
				>
					<BloodDropIcon className="size-14" />
				</motion.div>

				<Link
					href="/"
					className="group relative z-10 flex w-fit items-center gap-2.5"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
						<BloodDropIcon className="size-4" />
					</div>
					<span className="font-serif text-xl font-semibold italic tracking-tight text-white">
						BioMatch
					</span>
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: EASE_SMOOTH }}
					className="relative z-10 max-w-md"
				>
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white/70">
						<BloodDropIcon className="size-3 text-brand" />
						{eyebrow}
					</div>
					<h1 className="font-serif text-4xl font-medium leading-[1.15] tracking-tight text-white">
						{headline}
					</h1>
					<p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
						{description}
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: EASE_SMOOTH, delay: 0.15 }}
					className="relative z-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
				>
					{stats.map((stat) => (
						<div key={stat.label}>
							<div className="num text-2xl font-bold text-white">
								{stat.value}
							</div>
							<div className="mt-1 text-xs text-white/50">
								{stat.label}
							</div>
						</div>
					))}
				</motion.div>
			</div>

			<div className="flex flex-col px-6 py-8 lg:px-16 lg:py-10">
				<div className="flex items-center justify-between lg:hidden">
					<Link
						href="/"
						className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Home
					</Link>
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
						<BloodDropIcon className="size-3.5" />
					</div>
				</div>

				<div className="flex flex-1 items-center justify-center py-8">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: EASE_SMOOTH }}
						className="w-full max-w-md"
					>
						{children}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
