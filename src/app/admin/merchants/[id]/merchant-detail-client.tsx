"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	createMerchantStaff,
	setMerchantActive,
	setMerchantStaffActive,
	updateMerchant,
	type MerchantListItem,
	type MerchantStaffItem,
} from "@/servers/merchants";

function actionErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function MerchantDetailClient({
	merchant,
	staff,
}: {
	merchant: MerchantListItem;
	staff: MerchantStaffItem[];
}) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [name, setName] = useState(merchant.name);
	const [category, setCategory] = useState(merchant.category ?? "");
	const [address, setAddress] = useState(merchant.address ?? "");
	const [staffName, setStaffName] = useState("");
	const [staffEmail, setStaffEmail] = useState("");
	const [pending, setPending] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function run(key: string, action: () => Promise<unknown>, success?: string) {
		setPending(key);
		setError(null);
		setMessage(null);
		try {
			await action();
			if (success) setMessage(success);
			router.refresh();
		} catch (caught) {
			setError(actionErrorMessage(caught));
		} finally {
			setPending(null);
		}
	}

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<div className="space-y-4 rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Merchant details</h2>
				<div className="space-y-3">
					<div className="space-y-1">
						<label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">
							Name
						</label>
						<Input
							id="edit-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="edit-category" className="text-xs font-semibold text-muted-foreground">
							Category
						</label>
						<Input
							id="edit-category"
							value={category}
							onChange={(event) => setCategory(event.target.value)}
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="edit-address" className="text-xs font-semibold text-muted-foreground">
							Address
						</label>
						<Input
							id="edit-address"
							value={address}
							onChange={(event) => setAddress(event.target.value)}
							className="rounded-xl"
						/>
					</div>
				</div>
				{error && <p className="text-xs font-semibold text-destructive">{error}</p>}
				{message && <p className="text-xs font-semibold text-emerald-600">{message}</p>}
				<div className="flex flex-wrap gap-2">
					<Button
						className="rounded-xl"
						disabled={pending !== null || !callerUserId || !name.trim()}
						onClick={() =>
							run(
								"save",
								() =>
									updateMerchant(callerUserId, merchant.id, {
										name: name.trim(),
										category: category.trim(),
										address: address.trim(),
									}),
								"Merchant updated.",
							)
						}
					>
						{pending === "save" ? "Saving…" : "Save changes"}
					</Button>
					<Button
						variant="outline"
						className="rounded-xl"
						disabled={pending !== null || !callerUserId}
						onClick={() =>
							run(
								"toggle",
								() => setMerchantActive(callerUserId, merchant.id, !merchant.isActive),
								merchant.isActive
									? "Merchant deactivated. It can no longer be chosen for new redemptions."
									: "Merchant reactivated.",
							)
						}
					>
						{pending === "toggle"
							? "Saving…"
							: merchant.isActive
								? "Deactivate merchant"
								: "Reactivate merchant"}
					</Button>
				</div>
			</div>

			<div className="space-y-4 rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Merchant staff</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<label htmlFor="staff-name" className="text-xs font-semibold text-muted-foreground">
							Staff name
						</label>
						<Input
							id="staff-name"
							value={staffName}
							onChange={(event) => setStaffName(event.target.value)}
							placeholder="Cashier name"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="staff-email" className="text-xs font-semibold text-muted-foreground">
							Staff email
						</label>
						<Input
							id="staff-email"
							type="email"
							value={staffEmail}
							onChange={(event) => setStaffEmail(event.target.value)}
							placeholder="cashier@example.com"
							className="rounded-xl"
						/>
					</div>
				</div>
				<Button
					className="rounded-xl"
					disabled={pending !== null || !callerUserId || !staffName.trim() || !staffEmail.trim()}
					onClick={() =>
						run(
							"add-staff",
							async () => {
								await createMerchantStaff(callerUserId, merchant.id, {
									name: staffName.trim(),
									email: staffEmail.trim(),
								});
								setStaffName("");
								setStaffEmail("");
							},
							"Staff account linked. A set-password email was sent for new accounts.",
						)
					}
				>
					{pending === "add-staff" ? "Adding…" : "Add staff"}
				</Button>

				{staff.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No staff linked yet. Add the first cashier above.
					</p>
				) : (
					<ul className="divide-y divide-border">
						{staff.map((member) => (
							<li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-foreground">
										{member.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">{member.email}</p>
								</div>
								<StatusTag status={member.isActive ? "ok" : "low"}>
									{member.isActive ? "active" : "disabled"}
								</StatusTag>
								<Button
									size="sm"
									variant="outline"
									className="rounded-xl"
									disabled={pending !== null || !callerUserId}
									onClick={() =>
										run(`staff-${member.id}`, () =>
											setMerchantStaffActive(callerUserId, member.id, !member.isActive),
										)
									}
								>
									{pending === `staff-${member.id}`
										? "Saving…"
										: member.isActive
											? "Disable"
											: "Enable"}
								</Button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
