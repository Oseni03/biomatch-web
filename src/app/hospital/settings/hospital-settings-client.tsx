"use client";

import { useEffect, useState } from "react";
import { Building2, KeyRound, MonitorSmartphone } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
	useOrganizationProfile,
	useUpdateOrganizationProfile,
} from "@/hooks/use-hospital-dashboard";
import { NotificationPreferencesCard } from "@/components/donor/notification-preferences-card";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";
import { ReplayWalkthroughButton } from "@/components/walkthrough/walkthrough-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HospitalSettingsClient({
	organizationId,
	canEditProfile,
}: {
	organizationId: string;
	canEditProfile: boolean;
}) {
	return (
		<div className="space-y-6">
			<OrganizationProfileCard
				organizationId={organizationId}
				canEditProfile={canEditProfile}
			/>
			<NotificationPreferencesCard />
			<section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
				<h2 className="text-base font-bold text-foreground">Walkthrough</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					Replay the first-time tour of the hospital workspace.
				</p>
				<div className="mt-3">
					<ReplayWalkthroughButton audience="hospital" />
				</div>
			</section>
			<PasswordCard />
			<SessionsCard />
			<DeleteAccountSection />
		</div>
	);
}

function OrganizationProfileCard({
	organizationId,
	canEditProfile,
}: {
	organizationId: string;
	canEditProfile: boolean;
}) {
	const { data: profile, isLoading } = useOrganizationProfile(organizationId);
	const save = useUpdateOrganizationProfile(organizationId);
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [state, setState] = useState("");
	const [lga, setLga] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		if (profile) {
			setName(profile.name);
			setPhone(profile.phone ?? "");
			setAddress(profile.address);
			setState(profile.state);
			setLga(profile.lga ?? "");
		}
	}, [profile]);

	return (
		<section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
				<Building2 className="h-4 w-4" />
				Workspace profile
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				{canEditProfile
					? "Only owners and admins can edit these details. Dispatch coordinates stay unchanged — a facility move needs a fresh verification."
					: "Only owners and admins can edit these details. Ask your hospital admin to make changes."}
			</p>
			{isLoading ? (
				<p className="mt-4 text-xs text-muted-foreground">Loading profile…</p>
			) : profile ? (
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="org-name">Hospital name</Label>
						<Input
							id="org-name"
							value={name}
							disabled={!canEditProfile || save.isPending}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="org-phone">Contact phone</Label>
						<Input
							id="org-phone"
							value={phone}
							disabled={!canEditProfile || save.isPending}
							onChange={(event) => setPhone(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="org-address">Address</Label>
						<Input
							id="org-address"
							value={address}
							disabled={!canEditProfile || save.isPending}
							onChange={(event) => setAddress(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="org-state">State</Label>
						<Input
							id="org-state"
							value={state}
							disabled={!canEditProfile || save.isPending}
							onChange={(event) => setState(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="org-lga">LGA</Label>
						<Input
							id="org-lga"
							value={lga}
							disabled={!canEditProfile || save.isPending}
							onChange={(event) => setLga(event.target.value)}
						/>
					</div>
				</div>
			) : (
				<p className="mt-4 text-xs text-muted-foreground">
					Could not load the workspace profile.
				</p>
			)}
			{canEditProfile && profile && (
				<div className="mt-4 flex items-center gap-3">
					<Button
						className="rounded-2xl"
						disabled={save.isPending}
						onClick={() => {
							setSaved(false);
							save.mutate(
								{
									name,
									phone: phone || null,
									address,
									state,
									lga: lga || null,
								},
								{ onSuccess: () => setSaved(true) },
							);
						}}
					>
						{save.isPending ? "Saving…" : "Save changes"}
					</Button>
					{saved && (
						<p className="text-xs font-semibold text-emerald-600">
							Profile saved.
						</p>
					)}
				</div>
			)}
			{save.isError && (
				<p className="mt-3 text-xs font-semibold text-red-600">
					Could not save:{" "}
					{save.error instanceof Error ? save.error.message : "unknown error"}
				</p>
			)}
		</section>
	);
}

function PasswordCard() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
		"idle",
	);
	const [error, setError] = useState("");

	async function onSubmit() {
		setStatus("saving");
		setError("");
		const result = await authClient.changePassword({
			currentPassword,
			newPassword,
		});
		if (result.error) {
			setError(result.error.message ?? "Could not change password");
			setStatus("error");
			return;
		}
		setCurrentPassword("");
		setNewPassword("");
		setStatus("saved");
	}

	return (
		<section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
				<KeyRound className="h-4 w-4" />
				Change password
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Use at least 8 characters. You stay signed in on this device.
			</p>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="current-password">Current password</Label>
					<Input
						id="current-password"
						type="password"
						autoComplete="current-password"
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="new-password">New password</Label>
					<Input
						id="new-password"
						type="password"
						autoComplete="new-password"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
					/>
				</div>
			</div>
			<div className="mt-4 flex items-center gap-3">
				<Button
					className="rounded-2xl"
					disabled={
						status === "saving" ||
						!currentPassword ||
						newPassword.length < 8
					}
					onClick={onSubmit}
				>
					{status === "saving" ? "Updating…" : "Update password"}
				</Button>
				{status === "saved" && (
					<p className="text-xs font-semibold text-emerald-600">
						Password updated.
					</p>
				)}
			</div>
			{status === "error" && (
				<p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
			)}
		</section>
	);
}

function SessionsCard() {
	const { data: sessions, isLoading, refetch } = useQuery({
		queryKey: ["user-sessions"],
		queryFn: async () => {
			const result = await authClient.listSessions();
			if (result.error) {
				throw new Error(
					result.error.message ?? "Could not load sessions",
				);
			}
			return result.data ?? [];
		},
	});
	const [revoking, setRevoking] = useState(false);
	const [revoked, setRevoked] = useState(false);

	async function revokeOthers() {
		setRevoking(true);
		setRevoked(false);
		const result = await authClient.revokeOtherSessions();
		setRevoking(false);
		if (!result.error) {
			setRevoked(true);
			await refetch();
		}
	}

	return (
		<section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
				<MonitorSmartphone className="h-4 w-4" />
				Signed-in devices
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Every active session for this account. Signing out other devices
				keeps this one signed in.
			</p>
			{isLoading ? (
				<p className="mt-4 text-xs text-muted-foreground">
					Loading sessions…
				</p>
			) : !sessions || sessions.length <= 1 ? (
				<p className="mt-4 text-xs text-muted-foreground">
					Only this device is signed in. Nothing else to sign out.
				</p>
			) : (
				<>
					<ul className="mt-4 divide-y divide-border rounded-xl border border-border text-xs">
						{sessions.map((session) => (
							<li
								key={session.id}
								className="p-3 flex flex-wrap items-center justify-between gap-2"
							>
								<div>
									<p className="font-semibold text-foreground">
										{session.userAgent || "Unknown device"}
									</p>
									<p className="text-muted-foreground text-[11px]">
										{session.ipAddress || "Unknown location"} &bull;{" "}
										{new Date(session.createdAt).toLocaleDateString()}
									</p>
								</div>
							</li>
						))}
					</ul>
					<div className="mt-4 flex items-center gap-3">
						<Button
							variant="outline"
							className="rounded-2xl"
							disabled={revoking}
							onClick={revokeOthers}
						>
							{revoking ? "Signing out…" : "Sign out other devices"}
						</Button>
						{revoked && (
							<p className="text-xs font-semibold text-emerald-600">
								Other devices signed out.
							</p>
						)}
					</div>
				</>
			)}
		</section>
	);
}
