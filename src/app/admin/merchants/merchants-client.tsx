"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	createMerchant,
	setMerchantActive,
	type MerchantListItem,
} from "@/servers/merchants";

function actionErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function MerchantsClient({
	merchants,
	page,
	totalPages,
	total,
	includeInactive,
}: {
	merchants: MerchantListItem[];
	page: number;
	totalPages: number;
	total: number;
	includeInactive: boolean;
}) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [name, setName] = useState("");
	const [category, setCategory] = useState("");
	const [address, setAddress] = useState("");
	const [pending, setPending] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function run(key: string, action: () => Promise<unknown>) {
		setPending(key);
		setError(null);
		try {
			await action();
			router.refresh();
		} catch (caught) {
			setError(actionErrorMessage(caught));
		} finally {
			setPending(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Add merchant</h2>
				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					<div className="space-y-1">
						<label htmlFor="merchant-name" className="text-xs font-semibold text-muted-foreground">
							Name
						</label>
						<Input
							id="merchant-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="e.g. FreshMart Yaba"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="merchant-category" className="text-xs font-semibold text-muted-foreground">
							Category (optional)
						</label>
						<Input
							id="merchant-category"
							value={category}
							onChange={(event) => setCategory(event.target.value)}
							placeholder="mart, mall…"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="merchant-address" className="text-xs font-semibold text-muted-foreground">
							Address (optional)
						</label>
						<Input
							id="merchant-address"
							value={address}
							onChange={(event) => setAddress(event.target.value)}
							placeholder="Street, area, city"
							className="rounded-xl"
						/>
					</div>
				</div>
				{error && <p className="mt-3 text-xs font-semibold text-destructive">{error}</p>}
				<Button
					className="mt-4 rounded-xl"
					disabled={pending !== null || !callerUserId || !name.trim()}
					onClick={() =>
						run("create", async () => {
							await createMerchant(callerUserId, {
								name: name.trim(),
								category: category.trim() || undefined,
								address: address.trim() || undefined,
							});
							setName("");
							setCategory("");
							setAddress("");
						})
					}
				>
					{pending === "create" ? "Adding…" : "Add merchant"}
				</Button>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-base font-bold text-foreground">
						All merchants · {total}
					</h2>
					<Link
						href={includeInactive ? "/admin/merchants" : "/admin/merchants?all=1"}
						className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
					>
						{includeInactive ? "Hide deactivated" : "Show deactivated"}
					</Link>
				</div>
				{merchants.length === 0 ? (
					<p className="mt-3 text-sm text-muted-foreground">
						{includeInactive
							? "No merchants match this view."
							: "Every merchant is currently deactivated. Show deactivated to reactivate one."}
					</p>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{merchants.map((merchant) => (
							<li key={merchant.id} className="flex flex-wrap items-center gap-3 py-3">
								<div className="min-w-0 flex-1">
									<Link
										href={`/admin/merchants/${merchant.id}`}
										className="truncate text-sm font-semibold text-foreground hover:underline"
									>
										{merchant.name}
									</Link>
									<p className="truncate text-xs text-muted-foreground">
										{merchant.category ?? "No category"} · {merchant.staffCount}{" "}
										{merchant.staffCount === 1 ? "staff" : "staff"} ·{" "}
										{merchant.issuedCount} vouchers issued
									</p>
								</div>
								<StatusTag status={merchant.isActive ? "ok" : "low"}>
									{merchant.isActive ? "active" : "deactivated"}
								</StatusTag>
								<Button
									size="sm"
									variant="outline"
									className="rounded-xl"
									disabled={pending !== null || !callerUserId}
									onClick={() =>
										run(`toggle-${merchant.id}`, () =>
											setMerchantActive(callerUserId, merchant.id, !merchant.isActive),
										)
									}
								>
									{pending === `toggle-${merchant.id}`
										? "Saving…"
										: merchant.isActive
											? "Deactivate"
											: "Reactivate"}
								</Button>
							</li>
						))}
					</ul>
				)}
				{totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
						<span>
							Page {page} of {totalPages}
						</span>
						<div className="flex gap-2">
							{page > 1 && (
								<Button asChild size="sm" variant="outline" className="rounded-xl">
									<Link
										href={`/admin/merchants?page=${page - 1}${includeInactive ? "&all=1" : ""}`}
									>
										Previous
									</Link>
								</Button>
							)}
							{page < totalPages && (
								<Button asChild size="sm" variant="outline" className="rounded-xl">
									<Link
										href={`/admin/merchants?page=${page + 1}${includeInactive ? "&all=1" : ""}`}
									>
										Next
									</Link>
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
