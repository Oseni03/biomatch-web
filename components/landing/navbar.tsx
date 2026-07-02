"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, LayoutDashboard, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { data: session } = authClient.useSession();

	const handleNavLink = (e: React.MouseEvent, sectionId: string) => {
		e.preventDefault();
		const el = document.getElementById(sectionId);
		if (el) el.scrollIntoView({ behavior: "smooth" });
		setIsMenuOpen(false);
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
		setIsMenuOpen(false);
	};

	return (
		<nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
			<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
				{/* Logo */}
				<Link
					href="/"
					className="flex items-center gap-2.5 group cursor-pointer select-none"
				>
					<div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105 duration-300">
						<Heart className="h-4 w-4 text-white fill-current" />
					</div>
					<span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
						BioMatch
					</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-10 text-sm">
					<a
						href="#mission"
						onClick={(e) => handleNavLink(e, "mission")}
						className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200"
					>
						Why Us
					</a>
					<a
						href="#services"
						onClick={(e) => handleNavLink(e, "services")}
						className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200"
					>
						How It Works
					</a>
					<a
						href="#impact"
						onClick={(e) => handleNavLink(e, "impact")}
						className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200"
					>
						Impact
					</a>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-3">
					<ThemeToggle />

					{session ? (
						<div className="hidden md:flex items-center gap-3">
							<Button
								variant="outline"
								className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
								asChild
							>
								<Link href={`/donor`}>
									<LayoutDashboard className="h-4 w-4 mr-1.5" />
									Console
								</Link>
							</Button>
							<button
								onClick={handleSignOut}
								className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
							>
								Sign Out
							</button>
						</div>
					) : (
						<div className="hidden md:flex items-center gap-2">
							<Button variant="ghost" className="text-slate-600 dark:text-slate-400" asChild>
								<Link href="/auth/login">Sign In</Link>
							</Button>
							<Button className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30" asChild>
								<Link href="/auth/signup">
									Join Network
									<ArrowRight className="h-4 w-4 ml-1.5" />
								</Link>
							</Button>
						</div>
					)}

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						<Menu className="h-5 w-5 text-slate-900 dark:text-white" />
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="flex flex-col gap-4">
						<a
							href="#mission"
							onClick={(e) => handleNavLink(e, "mission")}
							className="text-slate-900 dark:text-white font-medium hover:text-red-500 transition-colors"
						>
							Why Us
						</a>
						<a
							href="#services"
							onClick={(e) => handleNavLink(e, "services")}
							className="text-slate-900 dark:text-white font-medium hover:text-red-500 transition-colors"
						>
							How It Works
						</a>
						<a
							href="#impact"
							onClick={(e) => handleNavLink(e, "impact")}
							className="text-slate-900 dark:text-white font-medium hover:text-red-500 transition-colors"
						>
							Impact
						</a>
						<div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
							{session ? (
								<>
									<Link
										href={`/donor`}
										onClick={() => setIsMenuOpen(false)}
										className="block text-slate-900 dark:text-white font-medium py-2 hover:text-red-500 transition-colors"
									>
										Go to Console
									</Link>
									<button
										onClick={handleSignOut}
										className="w-full text-left text-red-500 font-medium py-2 mt-2 cursor-pointer"
									>
										Sign Out
									</button>
								</>
							) : (
								<>
									<Link
										href="/auth/login"
										onClick={() => setIsMenuOpen(false)}
										className="block text-slate-900 dark:text-white font-medium py-2 hover:text-red-500 transition-colors mb-3"
									>
										Sign In
									</Link>
									<Button className="w-full bg-red-500 hover:bg-red-600 text-white" asChild>
										<Link href="/auth/signup">Join the Network</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}