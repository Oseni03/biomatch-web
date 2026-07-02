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
		<nav className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-b border-border transition-all duration-300">
			<div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-3 group cursor-pointer select-none"
				>
					<div className="w-7 h-7 bg-brand rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
						<Heart className="h-4 w-4 text-white fill-current" />
					</div>
					<span className="font-semibold text-2xl tracking-tighter text-foreground">
						BioMatch
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
					<a
						href="#mission"
						onClick={(e) => handleNavLink(e, "mission")}
						className="hover:text-brand transition-colors duration-200 font-medium"
					>
						Mission
					</a>
					<a
						href="#services"
						onClick={(e) => handleNavLink(e, "services")}
						className="hover:text-brand transition-colors duration-200 font-medium"
					>
						Services
					</a>
					<a
						href="#impact"
						onClick={(e) => handleNavLink(e, "impact")}
						className="hover:text-brand transition-colors duration-200 font-medium"
					>
						Impact
					</a>
				</div>

				<div className="flex items-center gap-4">
					<ThemeToggle />

					{session ? (
						<div className="hidden md:flex items-center gap-4">
							<Button
								variant="secondary"
								className="flex items-center gap-2 [&_svg]:size-4"
								asChild
							>
								<Link href={`/donor`}>
									<LayoutDashboard />
									Go to Console
								</Link>
							</Button>
							<button
								onClick={handleSignOut}
								className="hidden md:block border border-border text-muted-foreground hover:text-brand hover:border-brand/30 text-sm font-medium px-5 py-2 rounded-[10px] dark:border-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
							>
								Sign Out
							</button>
						</div>
					) : (
						<div className="hidden md:flex items-center gap-3">
							<Button variant="ghost" asChild>
								<Link href="/auth/login">Sign In</Link>
							</Button>
							<Button asChild>
								<Link href="/auth/signup">Join Network</Link>
							</Button>
						</div>
					)}

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 transition-transform hover:rotate-90 rounded-xl hover:bg-muted cursor-pointer"
					>
						<Menu className="h-5 w-5" />
					</button>
				</div>
			</div>

			{isMenuOpen && (
				<div className="md:hidden border-t border-border bg-card px-6 py-8 animate-in slide-in-from-top-2 duration-300">
					<div className="flex flex-col gap-6 text-base text-muted-foreground">
						<a
							href="#mission"
							onClick={(e) => handleNavLink(e, "mission")}
							className="hover:text-brand transition-colors font-medium"
						>
							Mission
						</a>
						<a
							href="#services"
							onClick={(e) => handleNavLink(e, "services")}
							className="hover:text-brand transition-colors font-medium"
						>
							Services
						</a>
						<a
							href="#impact"
							onClick={(e) => handleNavLink(e, "impact")}
							className="hover:text-brand transition-colors font-medium"
						>
							Impact
						</a>

						{session ? (
							<>
								<Link
									href={`/donor}`}
									onClick={() => setIsMenuOpen(false)}
									className="w-full text-left font-medium hover:text-brand py-2 border-t border-border"
								>
									Go to Console
								</Link>
								<button
									onClick={handleSignOut}
									className="w-full text-left font-medium text-brand py-2 cursor-pointer"
								>
									Sign Out
								</button>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									onClick={() => setIsMenuOpen(false)}
									className="w-full text-left font-medium hover:text-brand py-2 border-t border-border"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									onClick={() => setIsMenuOpen(false)}
									className="bg-brand text-white font-medium py-3.5 rounded-[10px] text-center shadow-brand block"
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
