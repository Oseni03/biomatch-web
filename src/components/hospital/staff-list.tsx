import { Users } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { StatusTag } from "@/components/brand/status-tag";
import { INVITABLE_ROLES, type InvitableRole } from "@/lib/organization-access";
import type { StaffMember } from "@/servers/staff";

interface StaffListProps {
	staffList: StaffMember[];
	loading: boolean;
	isAdmin: boolean;
	currentUserId?: string;
	onRoleChange: (memberId: string, role: InvitableRole) => void;
	onRemove: (memberId: string) => void;
	onCancelInvite: (invitationId: string) => void;
}

export function StaffList({
	staffList,
	loading,
	isAdmin,
	currentUserId,
	onRoleChange,
	onRemove,
	onCancelInvite,
}: StaffListProps) {
	return (
		<Card className="bg-card border-border rounded-xl p-6 lg:col-span-2 text-left shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<Users className="h-5 w-5 text-brand" />
					Authorized Staff Accounts
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Manage medical practitioners authorized to trigger
					emergency broadcasts
				</CardDescription>
			</CardHeader>

			{loading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="h-16 animate-pulse rounded-2xl bg-muted"
						/>
					))}
				</div>
			) : staffList.length === 0 ? (
				<div className="py-10 text-center text-sm text-muted-foreground">
					No staff accounts yet. Add your first practitioner.
				</div>
			) : (
				<div className="space-y-4">
					{staffList.map((st) => {
						const isMe =
							st.status === "active" &&
							st.userId === currentUserId;
						const isInvitableRole = (
							INVITABLE_ROLES as readonly string[]
						).includes(st.role);

						return (
							<div
								key={st.id}
								className="flex justify-between items-center p-3.5 bg-muted border-border rounded-2xl"
							>
								<div>
									<span className="font-bold text-sm text-foreground block">
										{st.name}
										{isMe && (
											<span className="ml-2 text-[10px] font-mono text-muted-foreground">
												(you)
											</span>
										)}
									</span>
									<span className="text-xs text-muted-foreground mt-0.5 block">
										{st.email}
									</span>
								</div>
								<div className="flex items-center gap-3">
									{isAdmin &&
									st.status === "active" &&
									isInvitableRole ? (
										<select
											value={st.role}
											disabled={isMe}
											onChange={(e) =>
												onRoleChange(
													st.id,
													e.target
														.value as InvitableRole,
												)
											}
											className="px-2 py-1 bg-card border border-border rounded-lg text-xs font-medium"
										>
											{INVITABLE_ROLES.map((r) => (
												<option key={r} value={r}>
													{r}
												</option>
											))}
										</select>
									) : (
										<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider border border-border bg-brand-light text-brand">
											{st.role}
										</span>
									)}
									<StatusTag
										status={
											st.status === "active"
												? "ok"
												: "info"
										}
									>
										{st.status === "active"
											? "Active"
											: "Pending"}
									</StatusTag>
									{isAdmin &&
										st.status === "active" &&
										!isMe && (
											<button
												onClick={() =>
													onRemove(st.id)
												}
												className="text-[10px] text-destructive hover:text-destructive/80 font-semibold cursor-pointer"
											>
												Remove
											</button>
										)}
									{isAdmin && st.status === "pending" && (
										<button
											onClick={() =>
												onCancelInvite(st.id)
											}
											className="text-[10px] text-destructive hover:text-destructive/80 font-semibold cursor-pointer"
										>
											Cancel
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
}
