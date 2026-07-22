"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
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
			<Card className="rounded-3xl p-2">
				<CardHeader className="pb-2 pt-6 text-center">
					<CardTitle className="text-2xl font-semibold tracking-tighter">
						Invitation Not Found
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						This invitation link is invalid, expired, or has
						already been used.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 pt-0 text-center">
					<Link
						href="/auth/login"
						className="text-sm font-medium text-brand hover:text-brand-hover"
					>
						Go to Sign In
					</Link>
				</CardContent>
			</Card>
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
			<Card className="rounded-3xl p-2">
				<CardHeader className="relative pb-2 pt-6 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand">
						<BloodDropIcon className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-2xl font-semibold tracking-tighter">
						Join {invitation.organizationName}
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						You've been invited as a{" "}
						<span className="font-medium text-foreground">
							{invitation.role}
						</span>
						.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 pt-0">
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
				</CardContent>
			</Card>
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
		<Card className="rounded-3xl p-2">
			<CardHeader className="relative pb-2 pt-6 text-center">
				<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand">
					<BloodDropIcon className="h-5 w-5 text-white" />
				</div>
				<CardTitle className="text-2xl font-semibold tracking-tighter">
					Join {invitation.organizationName}
				</CardTitle>
				<CardDescription className="mt-2 text-sm text-muted-foreground">
					Create your account to accept this invitation as a{" "}
					<span className="font-medium text-foreground">
						{invitation.role}
					</span>
					.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6 pt-0">
				{error && (
					<div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
						{error}
					</div>
				)}
				<form onSubmit={handleSignUp} className="space-y-6">
					<div>
						<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
							Full Name *
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Dr. Ayomide Oseni"
							className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
							required
						/>
					</div>

					<div>
						<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
							Email
						</label>
						<input
							type="email"
							value={invitation.email}
							disabled
							className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
						/>
					</div>

					<div>
						<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
							Password *
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="At least 6 characters"
								className="w-full rounded-xl border-border bg-muted px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground hover:text-foreground"
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
						{isLoading ? "Creating Account..." : "Accept & Join"}
					</Button>
				</form>

				<div className="mt-8 border-t border-border pt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/auth/login"
							className="font-medium text-brand hover:text-brand-hover"
						>
							Sign In
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
