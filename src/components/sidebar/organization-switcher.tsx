"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import {
	listMyOrganizations,
	switchActiveOrganization,
	type MyOrganization,
} from "@/servers/team";

export function OrganizationSwitcher({
	userId,
	currentOrganizationId,
}: {
	userId: string;
	currentOrganizationId?: string;
}) {
	const router = useRouter();
	const [organizations, setOrganizations] = useState<MyOrganization[]>([]);
	const [switching, setSwitching] = useState(false);

	useEffect(() => {
		let cancelled = false;
		listMyOrganizations(userId)
			.then((rows) => {
				if (!cancelled) setOrganizations(rows);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	if (organizations.length < 2) {
		return null;
	}

	async function handleSwitch(organizationId: string) {
		if (!organizationId || organizationId === currentOrganizationId) return;
		setSwitching(true);
		try {
			await switchActiveOrganization(organizationId, userId);
			router.push("/hospital");
			router.refresh();
		} finally {
			setSwitching(false);
		}
	}

	return (
		<label className="block rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3.5">
			<span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
				<ArrowLeftRight className="size-3" aria-hidden="true" />
				Switch hospital
			</span>
			<select
				className="mt-2 w-full truncate rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 text-xs font-semibold text-sidebar-foreground"
				value={currentOrganizationId ?? ""}
				disabled={switching}
				onChange={(event) => handleSwitch(event.target.value)}
				aria-label="Switch active hospital"
			>
				{organizations.map((organization) => (
					<option key={organization.organizationId} value={organization.organizationId}>
						{organization.name}
					</option>
				))}
			</select>
		</label>
	);
}
