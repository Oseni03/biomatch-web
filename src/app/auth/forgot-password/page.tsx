"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
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
			description="Enter the email on your BioMatch account and we’ll send a secure reset link."
			stats={STATS}
		>
			<Card className="rounded-3xl p-2">
				<CardHeader className="relative pb-2 pt-6 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 scale-100 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 hover:scale-105">
						<BloodDropIcon className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Forgot password
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						We’ll send a reset link to your inbox.
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
									onChange={(event) => setEmail(event.target.value)}
									placeholder="example@biomatch.org"
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
				</CardContent>
			</Card>
		</AuthShell>
	);
}
