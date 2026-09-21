"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordField } from "@/components/auth/password-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { authClient } from "@/lib/auth-client";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Wordmark } from "@/components/brand/wordmark";
import {
	ConsentChoicesFields,
	EMPTY_CONSENT_CHOICES,
	requiredConsentsAccepted,
	type ConsentChoices,
} from "@/components/consent/consent-choices";
import { acceptConsents } from "@/servers/consent";

function SignupContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [consents, setConsents] = useState<ConsentChoices>(
		EMPTY_CONSENT_CHOICES,
	);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim() || !email.trim() || !password) {
			setError("Please complete all required fields");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (!requiredConsentsAccepted(consents)) {
			setError(
				"Please accept the Terms of Service, Privacy Policy and data processing consent to create your account",
			);
			return;
		}

		setIsLoading(true);

		const { error: signUpError } = await authClient.signUp.email({
			email: email.trim(),
			password,
			name: name.trim(),
		});

		if (signUpError) {
			setError(
				typeof signUpError === "string"
					? signUpError
					: (signUpError as { message?: string })?.message ?? "Account creation failed",
			);
			setIsLoading(false);
			return;
		}

		try {
			await acceptConsents({ marketing: consents.marketing });
		} catch {
			// No session yet (e.g. email verification pending): the consent
			// gate redirects to the re-consent screen on the next visit.
		}

		const callbackUrl = searchParams.get("callbackUrl");
		if (callbackUrl && callbackUrl.startsWith("/")) {
			router.push(callbackUrl);
		} else {
			router.push("/donor");
		}
	};

	return (
		<AuthShell
			eyebrow="Join The Network"
			headline={
				<>
					Every match starts
					<br />
					with <span className="italic text-brand">one signup.</span>
				</>
			}
			description="Create your account with email and password. You will complete your donor profile in the next step."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Join the Network"
				subtitle="Tell us who you are so hospitals can reach you in an emergency."
				error={error}
				onSubmit={handleSubmit}
				footer={
					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-brand transition-colors hover:text-brand-hover"
							>
								Sign In
							</Link>
						</p>
					</div>
				}
			>
				<AuthInput
					id="signup-name"
					label="Full Name"
					requiredIndicator
					leftIcon={<User className="h-4 w-4" />}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. David Adebayo"
					autoComplete="name"
				/>
				<AuthInput
					id="signup-email"
					label="Email Address"
					requiredIndicator
					leftIcon={<Mail className="h-4 w-4" />}
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					autoComplete="email"
				/>
				<PasswordField
					id="signup-password"
					label="Password"
					requiredIndicator
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
					autoComplete="new-password"
				/>
				<ConsentChoicesFields
					value={consents}
					onChange={setConsents}
					idPrefix="signup"
				/>
				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</Button>
			</AuthForm>
		</AuthShell>
	);
}

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<SignupContent />
		</Suspense>
	);
}
