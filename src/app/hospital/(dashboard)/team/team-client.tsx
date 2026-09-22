"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailPlus, ShieldPlus, Users } from "lucide-react";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	changeMemberRole,
	createCustomRole,
	deleteCustomRole,
	inviteMember,
	reinstateMember,
	removeMember,
	suspendMember,
	type CustomRole,
	type PendingInvitation,
	type TeamMember,
} from "@/servers/team";

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

interface TeamClientProps {
	organizationId: string;
	callerUserId: string;
	initialMembers: TeamMember[];
	initialRoles: CustomRole[];
	initialInvitations: PendingInvitation[];
	canManage: boolean;
	catalog: Record<string, string[]>;
}

export function TeamClient({
	organizationId,
	callerUserId,
	initialMembers,
	initialRoles,
	initialInvitations,
	canManage,
	catalog,
}: TeamClientProps) {
	const router = useRouter();
	const [members, setMembers] = useState(initialMembers);
	const [roles, setRoles] = useState(initialRoles);
	const [invitations, setInvitations] = useState(initialInvitations);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [roleName, setRoleName] = useState("");
	const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function refresh() {
		router.refresh();
	}

	async function run(key: string, action: () => Promise<unknown>, success: string) {
		setBusy(key);
		setError(null);
		setMessage(null);
		try {
			await action();
			setMessage(success);
			await refresh();
		} catch (caught) {
			setError(errorMessage(caught));
		} finally {
			setBusy(null);
		}
	}

	async function handleInvite(event: React.FormEvent) {
		event.preventDefault();
		await run(
			"invite",
			async () => {
				const result = await inviteMember(organizationId, callerUserId, {
					email: inviteEmail,
					role: inviteRole,
				});
				setInvitations((rows) => [
					...rows,
					{
						id: result.invitationId,
						email: inviteEmail.trim().toLowerCase(),
						role: inviteRole,
						expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						inviterName: "You",
					},
				]);
				setInviteEmail("");
			},
			"Invitation sent. The invitee joins through the accept-invitation link.",
		);
	}

	async function handleCreateRole(event: React.FormEvent) {
		event.preventDefault();
		await run(
			"create-role",
			async () => {
				const created = await createCustomRole(organizationId, callerUserId, {
					name: roleName,
					permissions: rolePermissions,
				});
				setRoles((rows) => [
					...rows,
					{
						id: created.id,
						role: created.role,
						permissions: rolePermissions,
						createdAt: new Date(),
						inUse: false,
					},
				]);
				setRoleName("");
				setRolePermissions({});
			},
			"Custom role created.",
		);
	}

	function togglePermission(resource: string, action: string) {
		setRolePermissions((current) => {
			const actions = current[resource] ?? [];
			const next = actions.includes(action)
				? actions.filter((item) => item !== action)
				: [...actions, action];
			if (next.length === 0) {
				const rest: Record<string, string[]> = {};
				for (const [key, value] of Object.entries(current)) {
					if (key !== resource) rest[key] = value;
				}
				return rest;
			}
			return { ...current, [resource]: next };
		});
	}

	const roleOptions = ["member", "admin", ...roles.map((role) => role.role)];

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Team & roles"
				subtitle="Invite staff, assign roles and control who can manage blood requests."
			/>

			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
					{error}
				</p>
			)}
			{message && (
				<p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs font-semibold text-emerald-600">
					{message}
				</p>
			)}

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<Users className="h-4 w-4" /> Members ({members.length})
				</h2>
				<ul className="mt-3 divide-y divide-border">
					{members.map((member) => (
						<li key={member.userId} className="flex flex-wrap items-center gap-3 py-3">
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-foreground">
									{member.name}
									{member.userId === callerUserId && (
										<span className="ml-2 text-[10px] font-bold uppercase text-muted-foreground">
											You
										</span>
									)}
								</p>
								<p className="truncate text-xs text-muted-foreground">{member.email}</p>
							</div>
							<span
								className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
									member.suspended
										? "bg-destructive/10 text-destructive"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{member.suspended ? "Suspended" : member.role}
							</span>
							{canManage && member.userId !== callerUserId && !member.suspended && (
								<select
									className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs"
									value={member.role}
									disabled={busy !== null}
									onChange={(event) =>
										run(
											`role-${member.userId}`,
											async () => {
												const updated = await changeMemberRole(organizationId, callerUserId, {
													memberUserId: member.userId,
													role: event.target.value,
												});
												setMembers((rows) =>
													rows.map((row) =>
														row.userId === member.userId ? { ...row, role: updated.role } : row,
													),
												);
											},
											"Role updated.",
										)
									}
									aria-label={`Change role for ${member.name}`}
								>
									{roleOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							)}
							{canManage && member.userId !== callerUserId && !member.suspended && (
								<>
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl"
										disabled={busy !== null}
										onClick={() =>
											run(
												`suspend-${member.userId}`,
												async () => {
													await suspendMember(organizationId, callerUserId, {
														memberUserId: member.userId,
													});
													setMembers((rows) =>
														rows.map((row) =>
															row.userId === member.userId
																? { ...row, role: "suspended", suspended: true }
																: row,
														),
													);
												},
												"Member suspended.",
											)
										}
									>
										Suspend
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl"
										disabled={busy !== null}
										onClick={() =>
											run(
												`remove-${member.userId}`,
												async () => {
													await removeMember(organizationId, callerUserId, {
														memberUserId: member.userId,
													});
													setMembers((rows) =>
														rows.filter((row) => row.userId !== member.userId),
													);
												},
												"Member removed.",
											)
										}
									>
										Remove
									</Button>
								</>
							)}
							{canManage && member.suspended && (
								<Button
									size="sm"
									variant="outline"
									className="rounded-xl"
									disabled={busy !== null}
									onClick={() =>
										run(
											`reinstate-${member.userId}`,
											async () => {
												const restored = await reinstateMember(organizationId, callerUserId, {
													memberUserId: member.userId,
												});
												setMembers((rows) =>
													rows.map((row) =>
														row.userId === member.userId
															? { ...row, role: restored.role, suspended: false }
															: row,
													),
												);
											},
											"Member reinstated.",
										)
									}
								>
									Reinstate
								</Button>
							)}
						</li>
					))}
				</ul>
			</section>

			{canManage && (
				<section className="rounded-2xl border border-border bg-card p-6">
					<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
						<MailPlus className="h-4 w-4" /> Invite a team member
					</h2>
					<form onSubmit={handleInvite} className="mt-3 flex flex-col gap-3 sm:flex-row">
						<Input
							type="email"
							required
							value={inviteEmail}
							onChange={(event) => setInviteEmail(event.target.value)}
							placeholder="colleague@hospital.org"
							className="flex-1 rounded-xl"
						/>
						<select
							value={inviteRole}
							onChange={(event) => setInviteRole(event.target.value)}
							className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
							aria-label="Invite role"
						>
							{roleOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
						<Button type="submit" disabled={busy !== null} className="rounded-xl">
							{busy === "invite" ? "Sending…" : "Send invite"}
						</Button>
					</form>

					<div className="mt-4">
						<h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
							Pending invitations ({invitations.length})
						</h3>
						{invitations.length === 0 ? (
							<div className="mt-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center">
								<p className="text-xs font-semibold text-foreground">No pending invitations</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Invite a colleague above and the invitation lands here until accepted.
								</p>
							</div>
						) : (
							<ul className="mt-2 divide-y divide-border">
								{invitations.map((invitation) => (
									<li key={invitation.id} className="flex items-center justify-between gap-3 py-2 text-sm">
										<div className="min-w-0">
											<p className="truncate font-semibold text-foreground">{invitation.email}</p>
											<p className="text-xs text-muted-foreground">
												as {invitation.role} · expires {invitation.expiresAt.toLocaleDateString()}
											</p>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</section>
			)}

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<ShieldPlus className="h-4 w-4" /> Custom roles ({roles.length})
				</h2>
				{roles.length === 0 ? (
					<div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center">
						<p className="text-xs font-semibold text-foreground">No custom roles yet</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Owner, Admin and Member cover most teams. Create a custom role below
							for desk staff with limited permissions.
						</p>
					</div>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{roles.map((role) => (
							<li key={role.id} className="flex flex-wrap items-center gap-3 py-3">
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-foreground">{role.role}</p>
									<p className="text-xs text-muted-foreground">
										{Object.entries(role.permissions)
											.map(([resource, actions]) => `${resource}: ${actions.join(", ")}`)
											.join(" · ")}
										{role.inUse ? " · in use" : ""}
									</p>
								</div>
								{canManage && (
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl"
										disabled={busy !== null}
										onClick={() =>
											run(
												`delete-role-${role.id}`,
												async () => {
													await deleteCustomRole(organizationId, callerUserId, {
														roleId: role.id,
													});
													setRoles((rows) => rows.filter((row) => row.id !== role.id));
												},
												"Role deleted.",
											)
										}
									>
										Delete
									</Button>
								)}
							</li>
						))}
					</ul>
				)}

				{canManage && (
					<form onSubmit={handleCreateRole} className="mt-4 space-y-3 border-t border-border pt-4">
						<h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
							Create a custom role
						</h3>
						<Input
							value={roleName}
							onChange={(event) => setRoleName(event.target.value.toLowerCase())}
							placeholder="e.g. desk-officer"
							className="max-w-xs rounded-xl"
							required
							minLength={2}
							maxLength={40}
						/>
						<div className="space-y-2">
							{Object.entries(catalog).map(([resource, actions]) => (
								<div key={resource} className="flex flex-wrap items-center gap-2 text-xs">
									<span className="w-28 font-bold text-foreground">{resource}</span>
									{actions.map((action) => (
										<label key={action} className="flex items-center gap-1.5 text-muted-foreground">
											<input
												type="checkbox"
												checked={(rolePermissions[resource] ?? []).includes(action)}
												onChange={() => togglePermission(resource, action)}
												className="size-3.5 accent-red-700"
											/>
											{action}
										</label>
									))}
								</div>
							))}
						</div>
						<Button type="submit" disabled={busy !== null} className="rounded-xl">
							{busy === "create-role" ? "Creating…" : "Create role"}
						</Button>
					</form>
				)}
			</section>
		</div>
	);
}
