"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Twitter, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = {
	product: [
		{ label: "Why BioMatch", href: "#stats" },
		{ label: "How It Works", href: "#how-it-works" },
		{ label: "Pricing", href: "#" },
		{ label: "Status", href: "#" },
	],
	company: [
		{ label: "About", href: "#" },
		{ label: "Blog", href: "#" },
		{ label: "Careers", href: "#" },
		{ label: "Press", href: "#" },
	],
	legal: [
		{ label: "Privacy", href: "#" },
		{ label: "Terms", href: "#" },
		{ label: "Security", href: "#" },
		{ label: "Contact", href: "#" },
	],
	social: [
		{ icon: Twitter, href: "https://twitter.com", label: "Twitter" },
		{ icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
		{ icon: Mail, href: "mailto:hello@biomatch.org", label: "Email" },
	],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl px-4 py-16 md:py-20"
      >
				<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-5">
					<div className="col-span-1">
						<Link href="/" className="mb-6 flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
								<Heart className="h-4 w-4 fill-current text-white" />
							</div>
							<span className="text-lg font-bold text-white">
								BioMatch
							</span>
						</Link>
						<p className="text-sm leading-relaxed text-neutral-400">
							Emergency blood matching at scale. Saving lives
							across Africa.
						</p>
					</div>

					{(["product", "company", "legal"] as const).map((group) => (
						<div key={group}>
							<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
								{group}
							</h3>
							<ul className="space-y-3">
								{FOOTER_LINKS[group].map((link, i) => (
									<li key={i}>
										<Link
											href={link.href}
											className="text-sm text-neutral-400 transition-colors duration-200 hover:text-brand"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="flex flex-col items-center justify-between gap-6 border-t border-neutral-800 pt-8 md:flex-row">
					<p className="text-sm text-neutral-400">
						&copy; {new Date().getFullYear()} BioMatch. All rights
						reserved.
					</p>
					<div className="flex items-center gap-4">
						{FOOTER_LINKS.social.map((item, i) => {
							const Icon = item.icon;
							return (
								<Link
									key={i}
									href={item.href}
									aria-label={item.label}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-neutral-400 transition-all duration-200 hover:bg-neutral-800 hover:text-brand"
								>
									<Icon className="h-5 w-5" />
								</Link>
							);
						})}
					</div>
				</div>
			</motion.div>
		</footer>
	);
}
