import { redirect } from "next/navigation";
import { Building2, MapPin, Shield, ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId, getActiveOrganizationRole } from "@/servers/organization";
import { getHospitalSidebarContext } from "@/servers/hospital";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { MarketingConsentToggle } from "@/components/consent/marketing-consent-toggle";
import { PhoneVerification } from "@/components/profile/phone-verification";

export default async function HospitalProfilePage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(session.user.id);
	const [context, role] = await Promise.all([
		getHospitalSidebarContext(organizationId),
		getActiveOrganizationRole(organizationId, session.user.id).catch(() => "member"),
	]);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Hospital Workspace Profile"
				subtitle="Verified clinical details and emergency dispatch station credentials."
				action={
					<StatusTag status="ok">
						<ShieldCheck className="h-3.5 w-3.5" />
						Verified Hospital Node
					</StatusTag>
				}
			/>

			<div className="bg-card border border-border rounded-2xl p-6 space-y-6 text-xs">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
						<div className="text-muted-foreground uppercase font-bold text-[10px]">
							Hospital Facility Name
						</div>
						<div className="text-base font-bold text-foreground flex items-center gap-1.5">
							<Building2 className="h-4 w-4 text-brand" />
							{context.hospitalName || session.user.name || "Hospital Account"}
						</div>
						<div className="text-[11px] text-muted-foreground">
							Your role: <span className="font-semibold capitalize">{role}</span>
						</div>
					</div>

					<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
						<div className="text-muted-foreground uppercase font-bold text-[10px]">
							Location &amp; Dispatch Zone
						</div>
						<div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
							<MapPin className="h-3.5 w-3.5 text-brand" />
							{context.hospitalLocation || "Location not set"}
						</div>
						<div className="text-[11px] text-muted-foreground">
							Used for donor proximity matching
						</div>
					</div>

					<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
						<div className="text-muted-foreground uppercase font-bold text-[10px]">
							Blood Bank Status
						</div>
						<div className="text-sm font-semibold text-foreground capitalize">
							{context.bloodBankStatus}
						</div>
						<div className="text-[11px] text-muted-foreground">
							{context.bloodBankMessage}
						</div>
					</div>

					<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
						<div className="text-muted-foreground uppercase font-bold text-[10px]">
							Contact
						</div>
						<div className="text-sm font-semibold text-foreground">
							{session.user.email}
						</div>
						<div className="text-[11px] text-muted-foreground">
							Dispatch alerts and staff invites go here
						</div>
					</div>
				</div>

				<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
					<div className="text-muted-foreground uppercase font-bold text-[10px]">
						Communication Preferences
					</div>
					<MarketingConsentToggle />
				</div>

				<PhoneVerification />

				<div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
					<div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
						<Shield className="h-4 w-4 text-status-ok" />
						Emergency Data Protocol Compliance
					</div>
					<p className="text-muted-foreground leading-relaxed">
						This hospital node operates under strict healthcare data
						compliance. Donor identities are only revealed after a donor
						accepts an emergency alert, and only screened voluntary donors
						who opt in to emergency calls receive broadcast notices.
					</p>
				</div>
			</div>
		</div>
	);
}
