"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { authClient } from "@/lib/auth-client";
import { acceptInvitationSignUp } from "@/servers/auth";
import { isUserInAnyOrganization } from "@/servers/organization";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import type { InvitationPreview } from "@/servers/staff";

interface AcceptInvitationClientProps {
	invitation: InvitationPreview | null;
}

export function AcceptInvitationClient({
	invitation,
}: AcceptInvitationClientProps) {
	const router = useRouter();
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [alreadyInOrg, setAlreadyInOrg] = useState<boolean | null>(null);

	const loggedIn = !!session?.user;

	useEffect(() => {
		if (!loggedIn || !session?.user?.id) return;
		isUserInAnyOrganization(session.user.id).then(setAlreadyInOrg);
	}, [loggedIn, session?.user?.id]);

	if (!invitation || invitation.status !== "pending") {
		return (
			<AuthCard
				title="Invitation Not Found"
				description="This invitation link is invalid, expired, or has already been used."
			>
				<div className="text-center">
					<Link
						href="/auth/login"
						className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
					>
						Go to Sign In
					</Link>
				</div>
			</AuthCard>
		);
	}

	if (sessionLoading) {
		return null;
	}

	if (loggedIn) {
		const wrongEmail = session!.user.email !== invitation.email;

		const handleAccept = async () => {
			setError("");
			setIsLoading(true);
			try {
				await authClient.organization.acceptInvitation({
					invitationId: invitation.id,
				});
				router.push("/hospital");
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to accept invitation",
				);
			} finally {
				setIsLoading(false);
			}
		};

		return (
			<AuthCard
				icon={<BloodDropIcon className="h-5 w-5 text-white" />}
				title={`Join ${invitation.organizationName}`}
				description={
					<span>
						You've been invited as a{" "}
						<span className="font-medium text-foreground">
							{invitation.role}
						</span>
						.
					</span>
				}
			>
				{wrongEmail ? (
					<div className="rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
						This invitation was sent to {invitation.email}, but
						you're signed in as {session!.user.email}. Log out
						and sign in with the invited email to accept.
					</div>
				) : alreadyInOrg ? (
					<div className="rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
						Your account already belongs to an organization.
						Each account can only be a member of one hospital.
					</div>
				) : (
					<>
						{error && (
							<div className="mb-4 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
								{error}
							</div>
						)}
						<Button
							onClick={handleAccept}
							disabled={isLoading || alreadyInOrg === null}
							className="w-full rounded-2xl py-6 text-sm font-medium"
						>
							{isLoading ? "Accepting..." : "Accept Invitation"}
						</Button>
					</>
				)}
			</AuthCard>
		);
	}

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name || !password) {
			setError("Please complete all required fields");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);
		const result = await acceptInvitationSignUp({
			invitationId: invitation.id,
			fullName: name,
			password,
		});

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
			return;
		}

		router.push("/hospital");
	};

	return (
		<AuthCard
			icon={<BloodDropIcon className="h-5 w-5 text-white" />}
			title={`Join ${invitation.organizationName}`}
			description={
				<span>
					Create your account to accept this invitation as a{" "}
					<span className="font-medium text-foreground">
						{invitation.role}
					</span>
					.
				</span>
			}
		>
			{error && (
				<div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
					{error}
				</div>
			)}
			<form onSubmit={handleSignUp} className="space-y-5">
				<AuthFormField
					label="Full Name"
					value={name}
					onChange={setName}
					placeholder="e.g. Dr. Ayomide Oseni"
					required
				/>
				<AuthFormField
					label="Email"
					value={invitation.email}
					onChange={() => {}}
					disabled
				/>
				<AuthFormField
					label="Password"
					type="password"
					value={password}
					onChange={setPassword}
					placeholder="At least 6 characters"
					required
				/>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Creating Account..." : "Accept & Join"}
				</Button>
			</form>

			<div className="mt-8 border-t border-border pt-6 text-center">
				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						href="/auth/login"
						className="font-medium text-brand hover:text-brand-hover transition-colors"
					>
						Sign In
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
