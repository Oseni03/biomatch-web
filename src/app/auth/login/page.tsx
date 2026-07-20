"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

const STATS = [
	{ value: "2.3x", label: "Faster response" },
	{ value: "94%", label: "Donor activation" },
	{ value: "99.2%", label: "Match accuracy" },
];

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const { data, error: authError } = await authClient.signIn.email({
			email,
			password,
		});

		if (authError) {
			setError(typeof authError === "string" ? authError : (authError as any)?.message ?? "Invalid credentials");
			setIsLoading(false);
			return;
		}

		const userRole = (data?.user as { role?: string } | undefined)?.role;
		if (userRole) {
			router.push(`/${userRole}`);
		} else {
			setError("Login succeeded but unable to determine your role.");
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Welcome Back"
			headline={
				<>
					Sign in to the network
					<br />
					that <span className="italic text-brand">saves lives.</span>
				</>
			}
			description="Every donor and hospital on BioMatch is verified in real time — pick up right where you left off."
			stats={STATS}
		>
			<Card className="rounded-3xl p-2">
				<CardHeader className="relative pb-2 pt-6 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 scale-100 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 hover:scale-105">
						<BloodDropIcon className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Welcome back
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						Sign in to access your dashboard
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					{error && (
						<div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Email Address
							</label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
									<Mail className="h-4 w-4" />
								</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="example@biomatch.org"
									className="w-full rounded-2xl border-border bg-muted py-4 pl-11 pr-4 text-sm transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
									required
								/>
							</div>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Password
								</label>
								<span className="cursor-pointer text-xs text-brand hover:text-brand-hover">
									Forgot password?
								</span>
							</div>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
									<Lock className="h-4 w-4" />
								</span>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full rounded-2xl border-border bg-muted py-4 pl-11 pr-12 text-sm transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-2xl py-6 text-sm font-medium"
						>
							{isLoading ? "Authenticating..." : "Sign in"}
						</Button>
					</form>

					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link
								href="/auth/signup"
								className="font-medium text-brand hover:text-brand-hover"
							>
								Register here
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
