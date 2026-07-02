"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Heart,
	ArrowLeft,
	Eye,
	EyeOff,
	Mail,
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

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
		<div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
			<div className="absolute top-8 left-6 md:left-12">
				<Button
					asChild
					variant="outline"
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 bg-muted border-border px-4 py-2 h-10 rounded-2xl"
				>
					<Link href="/">
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>

			<Card className="w-full max-w-md rounded-3xl p-2 shadow-sm relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(#ef444408_0.8px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />

				<CardHeader className="text-center relative pb-2 pt-6">
					<div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 scale-100 hover:scale-105 transition-transform duration-300">
						<Heart className="h-5 w-5 text-white fill-current animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Welcome back
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground mt-2">
						Sign in to access your dashboard
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					{error && (
						<div className="p-4 mb-6 text-sm text-brand bg-brand-light rounded-2xl border border-brand/20">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
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
									placeholder={"example@biomatch.org"}
									className="w-full pl-11 pr-4 py-4 bg-muted border-border rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
									required
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase">
									Password
								</label>
								<span className="text-xs text-brand hover:text-brand-hover cursor-pointer">
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
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="••••••••"
									className="w-full pl-11 pr-12 py-4 bg-muted border-border rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
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
							className="w-full py-6 font-medium rounded-2xl text-sm"
						>
							{isLoading ? "Authenticating..." : `Sign in`}
						</Button>
					</form>

					<div className="mt-8 pt-6 border-t border-border text-center">
						<p className="text-sm text-muted-foreground">
							Don't have an account?{" "}
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
		</div>
	);
}
