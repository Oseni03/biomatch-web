"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	getStaffMembers,
	inviteStaffMember,
	updateStaffRole,
	removeStaffMember,
	type StaffRole,
} from "@/servers/staff";
import { toast } from "sonner";

interface StaffAccountsProps {
	hospitalId: string;
}

interface StaffEntry {
	id: string;
	name: string;
	email: string;
	role: StaffRole;
	isActive: boolean;
}

const ROLE_OPTIONS: StaffRole[] = ["admin", "requester", "viewer"];

export function StaffAccounts({ hospitalId }: StaffAccountsProps) {
	const [staffList, setStaffList] = useState<StaffEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [newName, setNewName] = useState("");
	const [newEmail, setNewEmail] = useState("");
	const [newRole, setNewRole] = useState<StaffRole>("requester");

	const loadStaff = async () => {
		try {
			const data = await getStaffMembers(hospitalId);
			setStaffList(data);
		} catch {
			toast.error("Failed to load staff");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStaff();
	}, [hospitalId]);

	const handleAddStaff = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newName || !newEmail) return;
		try {
			await inviteStaffMember(hospitalId, newEmail, newName, newRole);
			toast.success("Staff member added");
			setNewName("");
			setNewEmail("");
			loadStaff();
		} catch {
			toast.error("Failed to add staff member");
		}
	};

	const handleRoleChange = async (userId: string, role: StaffRole) => {
		try {
			await updateStaffRole(userId, role);
			toast.success("Role updated");
			loadStaff();
		} catch {
			toast.error("Failed to update role");
		}
	};

	const handleRemove = async (userId: string) => {
		try {
			await removeStaffMember(userId);
			toast.success("Staff member removed");
			loadStaff();
		} catch {
			toast.error("Failed to remove staff member");
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
			<Card className="bg-card border-border rounded-xl p-6 lg:col-span-2 text-left shadow-sm transition-shadow hover:shadow-card-hover">
				<CardHeader className="p-0 pb-4 border-b border-border mb-6">
					<CardTitle className="text-base font-bold flex items-center gap-2">
						<Users className="h-5 w-5 text-brand" />
						Authorized Staff Accounts
					</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						Manage medical practitioners authorized to trigger emergency broadcasts
					</CardDescription>
				</CardHeader>

				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
						))}
					</div>
				) : staffList.length === 0 ? (
					<div className="py-10 text-center text-sm text-muted-foreground">
						No staff accounts yet. Add your first practitioner.
					</div>
				) : (
					<div className="space-y-4">
						{staffList.map((st) => (
							<div
								key={st.id}
								className="flex justify-between items-center p-3.5 bg-muted border-border rounded-2xl"
							>
								<div>
									<span className="font-bold text-sm text-foreground block">
										{st.name}
									</span>
									<span className="text-xs text-muted-foreground mt-0.5 block">
										{st.email}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<select
										value={st.role}
										disabled={!st.isActive}
										onChange={(e) =>
											handleRoleChange(st.id, e.target.value as StaffRole)
										}
										className="px-2 py-1 bg-white border border-border rounded-lg text-xs font-medium"
									>
										{ROLE_OPTIONS.map((r) => (
											<option key={r} value={r}>
												{r}
											</option>
										))}
									</select>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider ${
											st.isActive
												? "border border-green-200 bg-green-100 text-green-700"
												: "border border-red-200 bg-red-100 text-red-700"
										}`}
									>
										{st.isActive ? "Active" : "Inactive"}
									</span>
									{st.isActive && (
										<button
											onClick={() => handleRemove(st.id)}
											className="text-[10px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
										>
											Remove
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			<Card className="bg-card border-border rounded-xl p-6 lg:col-span-1 text-left shadow-sm transition-shadow hover:shadow-card-hover">
				<CardHeader className="p-0 pb-4 border-b border-border mb-6">
					<CardTitle className="text-base font-bold">
						Authorize Practitioner
					</CardTitle>
					<CardDescription className="text-xs text-muted-foreground">
						Grant dispatch permissions
					</CardDescription>
				</CardHeader>

				<form onSubmit={handleAddStaff} className="space-y-4">
					<div>
						<label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
							Doctor/Nurse Name
						</label>
						<input
							type="text"
							placeholder="Dr. Ayomide Oseni"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							className="w-full px-3.5 py-2.5 bg-muted border-border rounded-xl text-xs"
							required
						/>
					</div>

					<div>
						<label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
							Email
						</label>
						<input
							type="email"
							placeholder="doctor@hospital.org"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							className="w-full px-3.5 py-2.5 bg-muted border-border rounded-xl text-xs"
							required
						/>
					</div>

					<div>
						<label className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
							Role
						</label>
						<select
							value={newRole}
							onChange={(e) => setNewRole(e.target.value as StaffRole)}
							className="w-full px-3 py-2.5 bg-muted border-border rounded-xl text-xs"
						>
							{ROLE_OPTIONS.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
					</div>

					<button
						type="submit"
						className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-semibold text-xs rounded-2xl transition shadow-sm cursor-pointer"
					>
						Add Authorized Staff
					</button>
				</form>
			</Card>
		</div>
	);
}
