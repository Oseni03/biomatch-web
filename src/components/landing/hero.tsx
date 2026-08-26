"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { EASE_SMOOTH } from "@/lib/animations";
import { PhoneMockup } from "@/components/landing/phone-mockup";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-paper px-4 pb-20 pt-20 md:pb-28 md:pt-28">
			<div className="absolute inset-0 overflow-hidden" aria-hidden>
				<Image
					src="/images/hero-bg.jpg"
					alt=""
					fill
					priority
					className="scale-[1.8] object-cover object-center opacity-35"
				/>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_transparent_25%,_hsl(var(--paper))_78%)]" />
				<div className="absolute inset-0 bg-gradient-to-b from-paper/95 via-transparent to-paper" />
			</div>
			<motion.div
				aria-hidden
				animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="pointer-events-none absolute right-[10%] top-16 hidden text-brand/10 md:block"
			>
				<BloodDropIcon className="size-20" />
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
				className="pointer-events-none absolute left-[8%] top-40 hidden text-brand/10 md:block"
			>
				<BloodDropIcon className="size-12" />
			</motion.div>

			<div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.7,
						ease: EASE_SMOOTH,
						delay: 0.1,
					}}
					className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl"
				>
					Blood banking in your pocket.
					<br />
					<span className="font-bold text-brand">
						Real-time matching across Nigeria.
					</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.7,
						ease: EASE_SMOOTH,
						delay: 0.2,
					}}
					className="mx-auto mt-6 max-w-lg text-base text-muted-foreground md:text-lg"
				>
					BioMatch connects verified donors with hospitals the
					moment blood is needed. Every second counts when lives
					are on the line.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.7,
						ease: EASE_SMOOTH,
						delay: 0.3,
					}}
					className="mt-8 flex flex-wrap items-center justify-center gap-3"
				>
					<Button
						size="lg"
						className="h-11 rounded-full px-7 text-sm font-semibold"
						asChild
					>
						<Link href="/auth/signup">Become a Donor</Link>
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="h-11 rounded-full px-7 text-sm font-semibold"
						asChild
					>
						<Link href="/auth/login">
							Find Blood
							<ArrowRight className="ml-1.5 h-4 w-4" />
						</Link>
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.9,
						ease: EASE_SMOOTH,
						delay: 0.4,
					}}
					className="relative mt-16"
				>
					<PhoneMockup />
				</motion.div>
			</div>
		</section>
	);
}
