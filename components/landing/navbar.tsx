"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, LayoutDashboard } from "lucide-react";
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
		<nav className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-b border-gray-100 dark:border-zinc-805/40 dark:border-zinc-800 transition-all duration-300">
			<div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-3 group cursor-pointer select-none"
				>
					<div className="w-7 h-7 bg-red-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
						<Heart className="h-4 w-4 text-white fill-current" />
					</div>
					<span className="font-semibold text-2xl tracking-tighter">
						BioMatch
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-sm dark:text-zinc-300">
					<a
						href="#mission"
						onClick={(e) => handleNavLink(e, "mission")}
						className="hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 font-medium"
					>
						Mission
					</a>
					<a
						href="#services"
						onClick={(e) => handleNavLink(e, "services")}
						className="hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 font-medium"
					>
						Services
					</a>
					<a
						href="#impact"
						onClick={(e) => handleNavLink(e, "impact")}
						className="hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 font-medium"
					>
						Impact
					</a>
				</div>

				<div className="flex items-center gap-4">
					<ThemeToggle />

					{session ? (
						<div className="hidden md:flex items-center gap-4">
							<Button
								variant="outline"
								className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-2xl border-gray-200 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900 [&_svg]:size-4"
								asChild
							>
								{/* <Link href={`/${session.user.role}`}> */}
								<Link href={`/donor`}>
									<LayoutDashboard />
									Go to Console
								</Link>
							</Button>
							<button
								onClick={handleSignOut}
								className="hidden md:block border border-gray-150 text-gray-650 hover:text-red-600 hover:border-red-150 text-sm font-medium px-5 py-2.5 rounded-2xl dark:border-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
							>
								Sign Out
							</button>
						</div>
					) : (
						<div className="hidden md:flex items-center gap-3">
							<Button
								variant="ghost"
								className="rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
								asChild
							>
								<Link href="/auth/login">Sign In</Link>
							</Button>
							<Button
								className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
								asChild
							>
								<Link href="/auth/signup">Join Network</Link>
							</Button>
						</div>
					)}

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 transition-transform hover:rotate-90 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
					>
						<Menu className="h-5 w-5" />
					</button>
				</div>
			</div>

			{isMenuOpen && (
				<div className="md:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8 animate-in slide-in-from-top-2 duration-300">
					<div className="flex flex-col gap-6 text-base dark:text-zinc-300">
						<a
							href="#mission"
							onClick={(e) => handleNavLink(e, "mission")}
							className="hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium"
						>
							Mission
						</a>
						<a
							href="#services"
							onClick={(e) => handleNavLink(e, "services")}
							className="hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium"
						>
							Services
						</a>
						<a
							href="#impact"
							onClick={(e) => handleNavLink(e, "impact")}
							className="hover:text-red-600 dark:hover:text-red-500 transition-colors font-medium"
						>
							Impact
						</a>

						{session ? (
							<>
								<Link
									href={`/donor}`}
									onClick={() => setIsMenuOpen(false)}
									className="w-full text-left font-medium hover:text-red-600 py-2 border-t border-gray-100 dark:border-zinc-800"
								>
									Go to Console
								</Link>
								<button
									onClick={handleSignOut}
									className="w-full text-left font-medium text-red-600 py-2 cursor-pointer"
								>
									Sign Out
								</button>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									onClick={() => setIsMenuOpen(false)}
									className="w-full text-left font-medium hover:text-red-600 py-2 border-t border-gray-100 dark:border-zinc-800"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									onClick={() => setIsMenuOpen(false)}
									className="bg-red-600 text-white font-medium py-3.5 rounded-2xl text-center shadow-sm block"
								>
									Join the Network
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
