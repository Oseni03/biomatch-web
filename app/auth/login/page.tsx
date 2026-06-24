"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Heart,
	ArrowLeft,
	Eye,
	EyeOff,
	ShieldCheck,
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
import { loginWithRole } from "@/servers/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const result = await loginWithRole(email, password);

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
		}
		// If successful, middleware will redirect to role dashboard
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
			<div className="absolute top-8 left-6 md:left-12">
				<Button
					asChild
					variant="outline"
					className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 px-4 py-2 h-10 rounded-2xl"
				>
					<Link href="/">
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>

			<Card className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-2 shadow-sm relative overflow-hidden">
				{/* Decorative background */}
				<div className="absolute inset-0 bg-[radial-gradient(#ef444408_0.8px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />

				<CardHeader className="text-center relative pb-2 pt-6">
					<div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 scale-100 hover:scale-105 transition-transform duration-300">
						<Heart className="h-5 w-5 text-white fill-current animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Welcome back
					</CardTitle>
					<CardDescription className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
						Sign in to access your dashboard
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					{error && (
						<div className="p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email */}
						<div>
							<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
								Email Address
							</label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
									<Mail className="h-4 w-4" />
								</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={"example@biomatch.org"}
									className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase">
									Password
								</label>
								<span className="text-xs text-red-600 hover:text-red-700 cursor-pointer">
									Forgot password?
								</span>
							</div>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
									<Lock className="h-4 w-4" />
								</span>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="••••••••"
									className="w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full py-6 text-white bg-red-600 hover:bg-red-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 font-medium rounded-2xl shadow-sm transition-all duration-300 text-sm"
						>
							{isLoading ? "Authenticating..." : `Sign in`}
						</Button>
					</form>

					<div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
						<p className="text-sm text-gray-500 dark:text-zinc-400">
							Don't have an account?{" "}
							<Link
								href="/auth/signup"
								className="font-medium text-red-600 hover:text-red-700"
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
