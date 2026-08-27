"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setStatus("idle");
		setMessage("");
		setIsLoading(true);

		const response = await fetch("/api/auth/request-password-reset", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				redirectTo: `${window.location.origin}/auth/reset-password`,
			}),
		});

		const payload = await response.json().catch(() => ({}));

		if (!response.ok) {
			setStatus("error");
			setMessage(payload?.message ?? "Could not send the reset email.");
			setIsLoading(false);
			return;
		}

		setStatus("success");
		setMessage(
			"If this email exists in our system, a password reset link has been sent.",
		);
		setIsLoading(false);
	};

	return (
		<AuthShell
			eyebrow="Recover Access"
			headline={
				<>
					Reset your
					<br />
					<span className="italic text-brand">password.</span>
				</>
			}
			description="Enter the email on your BioMatch account and we'll send a secure reset link."
			stats={AUTH_STATS}
		>
			<AuthCard
				icon={<Mail className="h-5 w-5 text-white" />}
				title="Forgot password"
				description="We'll send a reset link to your inbox."
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

				<form onSubmit={handleSubmit} className="space-y-5">
					<AuthFormField
						label="Email Address"
						icon="mail"
						type="email"
						value={email}
						onChange={setEmail}
						placeholder="example@biomatch.org"
						required
					/>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-2xl py-6 text-sm font-medium"
					>
						{isLoading ? "Sending link..." : "Send reset link"}
					</Button>
				</form>

				<div className="mt-8 border-t border-border pt-6 text-center">
					<Link
						href="/auth/login"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to login
					</Link>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
