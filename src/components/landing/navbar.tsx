"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { cn } from "@/lib/utils";

export function Navbar() {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

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
		<motion.nav
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			className={cn(
				"sticky top-0 z-50 transition-all duration-300",
				scrolled
					? "border-b border-border bg-background/85 backdrop-blur-md shadow-card"
					: "border-b border-transparent bg-background/60 backdrop-blur-sm",
			)}
		>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				<Link href="/" className="group flex select-none items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
						<BloodDropIcon className="size-4" />
					</div>
					<span className="font-serif text-xl font-semibold italic tracking-tight text-foreground">
						BioMatch
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-10 text-sm">
					<a
						href="#partners"
						onClick={(e) => handleNavLink(e, "partners")}
						className="font-medium text-muted-foreground transition-colors hover:text-brand"
					>
						Stats
					</a>
					<a
						href="#features"
						onClick={(e) => handleNavLink(e, "features")}
						className="font-medium text-muted-foreground transition-colors hover:text-brand"
					>
						Features
					</a>
					<a
						href="#impact"
						onClick={(e) => handleNavLink(e, "impact")}
						className="font-medium text-muted-foreground transition-colors hover:text-brand"
					>
						Impact
					</a>
				</div>

				<div className="flex items-center gap-3">
					{session ? (
						<div className="hidden md:flex items-center gap-3">
							<Button variant="outline" asChild>
								<Link href={`/donor`}>
									<LayoutDashboard className="mr-1.5 h-4 w-4" />
									Console
								</Link>
							</Button>
							<button
								onClick={handleSignOut}
								className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								Sign Out
							</button>
						</div>
					) : (
						<div className="hidden md:flex items-center gap-2">
							<Button variant="outline" asChild>
								<Link href="/auth/login">Find Blood</Link>
							</Button>
							<Button asChild>
								<Link href="/auth/signup">Become a Donor</Link>
							</Button>
						</div>
					)}

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
						aria-label="Toggle menu"
					>
						{isMenuOpen ? (
							<X className="h-5 w-5 text-foreground" />
						) : (
							<Menu className="h-5 w-5 text-foreground" />
						)}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						className="overflow-hidden border-t border-border md:hidden"
					>
						<div className="space-y-4 bg-background px-6 py-6">
							<a
								href="#stats"
								onClick={(e) => handleNavLink(e, "stats")}
								className="block font-medium text-foreground transition-colors hover:text-brand"
							>
								Stats
							</a>
							<a
								href="#how-it-works"
								onClick={(e) => handleNavLink(e, "how-it-works")}
								className="block font-medium text-foreground transition-colors hover:text-brand"
							>
								Features
							</a>
							<a
								href="#impact"
								onClick={(e) => handleNavLink(e, "impact")}
								className="block font-medium text-foreground transition-colors hover:text-brand"
							>
								Impact
							</a>
							<div className="border-t border-border pt-4">
								{session ? (
									<>
										<Link
											href={`/donor`}
											onClick={() => setIsMenuOpen(false)}
											className="block py-2 font-medium text-foreground transition-colors hover:text-brand"
										>
											Go to Console
										</Link>
										<button
											onClick={handleSignOut}
											className="mt-2 w-full cursor-pointer py-2 text-left font-medium text-destructive"
										>
											Sign Out
										</button>
									</>
								) : (
									<>
										<Link
											href="/auth/login"
											onClick={() => setIsMenuOpen(false)}
											className="mb-3 block py-2 font-medium text-foreground transition-colors hover:text-brand"
										>
											Find Blood
										</Link>
										<Button className="w-full" asChild>
											<Link href="/auth/signup">Become a Donor</Link>
										</Button>
									</>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
}
