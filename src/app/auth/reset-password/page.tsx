"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";

function ResetPasswordContent() {
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
			stats={AUTH_STATS}
		>
			<AuthCard
				icon={<Lock className="h-5 w-5 text-white" />}
				title="Reset password"
				description="Set a new password for your account."
			>
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
					<form onSubmit={handleSubmit} className="space-y-5">
						<AuthFormField
							label="New Password"
							icon="lock"
							type="password"
							value={newPassword}
							onChange={setNewPassword}
							placeholder="At least 8 characters"
							required
						/>
						<AuthFormField
							label="Confirm Password"
							icon="lock"
							type="password"
							value={confirmPassword}
							onChange={setConfirmPassword}
							placeholder="Repeat your new password"
							required
						/>

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
			</AuthCard>
		</AuthShell>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<ResetPasswordContent />
		</Suspense>
	);
}
