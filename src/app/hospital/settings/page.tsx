import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import {
	getActiveOrganizationId,
	requireOrgPermission,
} from "@/servers/organization";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { Button } from "@/components/ui/button";
import { HospitalSettingsClient } from "./hospital-settings-client";

export default async function HospitalSettingsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(
		session.user.id,
	).catch(() => undefined);
	if (!organizationId) {
		return (
			<div className="space-y-8">
				<DashboardGreeting
					title="Account Settings"
					subtitle="Workspace profile, notifications and sign-in security."
				/>
				<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
					<h3 className="text-base font-semibold text-foreground">
						No hospital workspace attached
					</h3>
					<p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
						This account is not attached to a hospital workspace, so there
						are no settings to manage yet.
					</p>
					<Button asChild className="rounded-2xl">
						<Link href="/auth/signup?role=hospital">Register your hospital</Link>
					</Button>
				</div>
			</div>
		);
	}

	const canEditProfile = await requireOrgPermission(
		organizationId,
		session.user.id,
		{ organization: ["update"] },
	)
		.then(() => true)
		.catch(() => false);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Account Settings"
				subtitle="Workspace profile, notifications and sign-in security."
			/>
			<HospitalSettingsClient
				organizationId={organizationId}
				canEditProfile={canEditProfile}
			/>
		</div>
	);
}
