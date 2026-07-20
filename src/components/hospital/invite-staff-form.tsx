import { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import type { StaffRole } from "@/servers/staff";

const ROLE_OPTIONS: StaffRole[] = ["admin", "requester", "viewer"];

interface InviteStaffFormProps {
	onSubmit: (name: string, email: string, role: StaffRole) => void;
}

export function InviteStaffForm({ onSubmit }: InviteStaffFormProps) {
	const [newName, setNewName] = useState("");
	const [newEmail, setNewEmail] = useState("");
	const [newRole, setNewRole] = useState<StaffRole>("requester");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newName || !newEmail) return;
		onSubmit(newName, newEmail, newRole);
		setNewName("");
		setNewEmail("");
	};

	return (
		<Card className="bg-card border-border rounded-xl p-6 lg:col-span-1 text-left shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold">
					Authorize Practitioner
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Grant dispatch permissions
				</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit} className="space-y-4">
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
						onChange={(e) =>
							setNewRole(e.target.value as StaffRole)
						}
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
	);
}
