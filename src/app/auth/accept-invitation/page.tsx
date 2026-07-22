import { getInvitationPreview } from "@/servers/staff";
import { AcceptInvitationClient } from "@/components/auth/accept-invitation-client";
import { AuthShell } from "@/components/auth/auth-shell";

const STATS = [
	{ value: "2.3x", label: "Faster response" },
	{ value: "94%", label: "Donor activation" },
	{ value: "99.2%", label: "Match accuracy" },
];

export default async function AcceptInvitationPage({
	searchParams,
}: {
	searchParams: Promise<{ id?: string }>;
}) {
	const { id } = await searchParams;
	const invitation = id ? await getInvitationPreview(id) : null;

	return (
		<AuthShell
			eyebrow="Team Invitation"
			headline={
				<>
					Join your hospital's
					<br />
					<span className="italic text-brand">
						dispatch team.
					</span>
				</>
			}
			description="Accept your invitation to help manage blood inventory and respond to emergency requests."
			stats={STATS}
		>
			<AcceptInvitationClient invitation={invitation} />
		</AuthShell>
	);
}
