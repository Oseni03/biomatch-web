"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Building2, Users, HeartPulse, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
	{
		icon: Droplets,
		value: "8.7s",
		label: "Avg Response",
	},
	{
		icon: Building2,
		value: "92",
		label: "Hospitals",
	},
	{
		icon: Users,
		value: "14K+",
		label: "Lives Saved",
	},
	{
		icon: HeartPulse,
		value: "500+",
		label: "Donors Ready",
	},
];

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" as const },
	},
};

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-background px-4 pt-24 pb-16 md:pt-32 md:pb-24">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="flex-1 text-center lg:text-left"
					>
						<h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
							Digital Blood Banking
							<br />
							for Everyone
						</h1>
						<p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0">
							Connecting verified blood donors with hospitals across Africa in real
							time. Every second counts when lives are on the line.
						</p>
						<div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
							<Button size="lg" className="h-12 px-8 text-base font-semibold" asChild>
								<Link href="/auth/login">
									Find Blood
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="h-12 px-8 text-base font-semibold"
								asChild
							>
								<Link href="/auth/signup">Become a Donor</Link>
							</Button>
						</div>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="w-full max-w-lg lg:max-w-md"
					>
						<div className="grid grid-cols-2 gap-3 md:gap-4">
							{stats.map((stat) => {
								const Icon = stat.icon;
								return (
									<motion.div
										key={stat.label}
										variants={cardVariants}
										className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
											<Icon className="h-5 w-5" />
										</div>
										<div>
											<div className="text-2xl font-bold text-foreground md:text-3xl">
												{stat.value}
											</div>
											<div className="mt-0.5 text-xs text-muted-foreground md:text-sm">
												{stat.label}
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
