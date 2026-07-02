"use client";

import Link from "next/link";
import { Heart, Twitter, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = {
	product: [
		{ label: "Why BioMatch", href: "#mission" },
		{ label: "How It Works", href: "#services" },
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
	]
};

export function Footer() {
	return (
		<footer className="relative bg-slate-950 dark:bg-black border-t border-slate-800/50 overflow-hidden">
			{/* Decorative Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative">
				{/* Main Footer Content */}
				<div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
					<div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
						{/* Brand Column */}
						<div className="col-span-1">
							<Link href="/" className="flex items-center gap-2 mb-6">
								<div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
									<Heart className="h-4 w-4 text-white fill-current" />
								</div>
								<span className="font-bold text-lg text-white">BioMatch</span>
							</Link>
							<p className="text-sm text-slate-400 leading-relaxed">
								Emergency blood matching at scale. Saving lives across Africa.
							</p>
						</div>

						{/* Product Links */}
						<div>
							<h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Product</h3>
							<ul className="space-y-3">
								{FOOTER_LINKS.product.map((link, i) => (
									<li key={i}>
										<Link 
											href={link.href}
											className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company Links */}
						<div>
							<h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Company</h3>
							<ul className="space-y-3">
								{FOOTER_LINKS.company.map((link, i) => (
									<li key={i}>
										<Link 
											href={link.href}
											className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Legal Links */}
						<div>
							<h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Legal</h3>
							<ul className="space-y-3">
								{FOOTER_LINKS.legal.map((link, i) => (
									<li key={i}>
										<Link 
											href={link.href}
											className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Divider */}
					<div className="border-t border-slate-800/50 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
						{/* Left */}
						<div className="text-sm text-slate-400">
							<p>&copy; {new Date().getFullYear()} BioMatch. All rights reserved.</p>
						</div>

						{/* Social Icons */}
						<div className="flex items-center gap-6">
							{FOOTER_LINKS.social.map((item, i) => {
								const Icon = item.icon;
								return (
									<Link
										key={i}
										href={item.href}
										aria-label={item.label}
										target="_blank"
										rel="noopener noreferrer"
										className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all duration-200"
									>
										<Icon className="h-5 w-5" />
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}