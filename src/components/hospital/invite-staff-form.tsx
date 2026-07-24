import { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INVITABLE_ROLES, type InvitableRole } from "@/lib/organization-access";

interface InviteStaffFormProps {
	onSubmit: (email: string, role: InvitableRole) => void;
}

export function InviteStaffForm({ onSubmit }: InviteStaffFormProps) {
	const [newEmail, setNewEmail] = useState("");
	const [newRole, setNewRole] = useState<InvitableRole>("requester");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEmail) return;
		onSubmit(newEmail, newRole);
		setNewEmail("");
	};

	return (
		<Card className="bg-card border-border rounded-xl p-6 lg:col-span-1 text-left shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold">
					Authorize Practitioner
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Send an invitation to grant dispatch permissions
				</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit} className="space-y-4">
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
							setNewRole(e.target.value as InvitableRole)
						}
						className="w-full px-3 py-2.5 bg-muted border-border rounded-xl text-xs"
					>
						{INVITABLE_ROLES.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
				</div>

				<Button type="submit" className="w-full">
					Send Invitation
				</Button>
			</form>
		</Card>
	);
}
