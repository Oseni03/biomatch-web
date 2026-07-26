"use client";

import { BellRing } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { displayBloodGroup } from "@/lib/donor-types";
import { authClient } from "@/lib/auth-client";
import {
	useAlertsAwaitingConfirmation,
	useConfirmDonation,
} from "@/hooks/use-emergency-requests";

export function PendingDonationConfirmations({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data: session } = authClient.useSession();
	const staffUserId = session?.user?.id;
	const { data: alerts, isLoading } =
		useAlertsAwaitingConfirmation(organizationId);
	const confirmDonation = useConfirmDonation();

	if (isLoading || !alerts || alerts.length === 0) {
		return null;
	}

	return (
		<Card className="bg-card border-border rounded-xl p-6 text-left shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<BellRing className="h-5 w-5 text-brand" />
					Awaiting Hospital Confirmation
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Donors who confirmed they donated — staff still need to
					confirm the donation
				</CardDescription>
			</CardHeader>

			<div className="space-y-4">
				{alerts.map((alert) => (
					<div
						key={alert.id}
						className="flex justify-between items-center p-3.5 bg-muted border-border rounded-2xl"
					>
						<div className="flex items-center gap-3">
							{alert.donor.bloodGroup && (
								<BloodTypeBadge
									bloodGroup={alert.donor.bloodGroup}
									size="sm"
								/>
							)}
							<div>
								<span className="font-bold text-sm text-foreground block">
									{alert.donor.name}
								</span>
								<span className="text-xs text-muted-foreground mt-0.5 block">
									{displayBloodGroup(alert.request.bloodGroup)}{" "}
									&bull; confirmed{" "}
									{new Date(
										alert.donorConfirmedAt!,
									).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
						<Button
							size="sm"
							disabled={confirmDonation.isPending || !staffUserId}
							onClick={() =>
								staffUserId &&
								confirmDonation.mutate({
									alertId: alert.id,
									staffUserId,
								})
							}
							className="bg-status-ok text-white hover:bg-status-ok hover:opacity-90 hover:scale-100"
						>
							Confirm Donation
						</Button>
					</div>
				))}
			</div>
		</Card>
	);
}
