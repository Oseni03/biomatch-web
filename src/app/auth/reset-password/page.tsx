"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

const STATS = [
	{ value: "2.3x", label: "Faster response" },
	{ value: "94%", label: "Donor activation" },
	{ value: "99.2%", label: "Match accuracy" },
];

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

	const isReady = useMemo(() => Boolean(token), [token]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setStatus("idle");
		setMessage("");

		if (!isReady) {
			setStatus("error");
			setMessage("This reset link is missing a valid token.");
			return;
		}

		if (newPassword.length < 8) {
			setStatus("error");
			setMessage("Password must be at least 8 characters long.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setStatus("error");
			setMessage("Passwords do not match.");
			return;
		}

		setIsLoading(true);

		const response = await fetch("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				token,
				newPassword,
			}),
		});

		const payload = await response.json().catch(() => ({}));

		if (!response.ok) {
			setStatus("error");
			setMessage(payload?.message ?? "We couldn't reset your password.");
			setIsLoading(false);
			return;
		}

		setStatus("success");
		setMessage("Your password has been updated. You can sign in with your new credentials.");
		setIsLoading(false);
		setTimeout(() => router.push("/auth/login"), 1200);
	};

	return (
		<AuthShell
			eyebrow="Update Password"
			headline={
				<>
					Choose a new
					<br />
					<span className="italic text-brand">password.</span>
				</>
			}
			description="Create a secure password for your BioMatch account."
			stats={STATS}
		>
			<Card className="rounded-3xl p-2">
				<CardHeader className="relative pb-2 pt-6 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 scale-100 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 hover:scale-105">
						<BloodDropIcon className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Reset password
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						Set a new password for your account.
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					{message && (
						<div
							className={`mb-6 rounded-2xl border p-4 text-sm ${
								status === "success"
									? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700"
									: "border-brand/20 bg-brand-light text-brand"
							}`}
						>
							{message}
						</div>
					)}

					{!isReady ? (
						<div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
							This reset page needs a valid token from the email we sent you.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									New Password
								</label>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
										<Lock className="h-4 w-4" />
									</span>
									<input
										type={showPassword ? "text" : "password"}
										value={newPassword}
										onChange={(event) => setNewPassword(event.target.value)}
										placeholder="At least 8 characters"
										className="w-full rounded-2xl border-border bg-muted py-4 pl-11 pr-12 text-sm transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Confirm Password
								</label>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
										<Lock className="h-4 w-4" />
									</span>
									<input
										type={showPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										placeholder="Repeat your new password"
										className="w-full rounded-2xl border-border bg-muted py-4 pl-11 pr-4 text-sm transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
										required
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isLoading}
								className="w-full rounded-2xl py-6 text-sm font-medium"
							>
								{isLoading ? "Updating password..." : "Update password"}
							</Button>
						</form>
					)}

					<div className="mt-8 border-t border-border pt-6 text-center">
						<Link
							href="/auth/login"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Back to login
						</Link>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
