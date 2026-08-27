import { getInvitationPreview } from "@/servers/staff";
import { AcceptInvitationClient } from "@/components/auth/accept-invitation-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { AUTH_STATS } from "@/components/auth/auth-constants";

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
					Join your hospital&apos;s
					<br />
					<span className="italic text-brand">
						dispatch team.
					</span>
				</>
			}
			description="Accept your invitation to help manage blood inventory and respond to emergency requests."
			stats={AUTH_STATS}
		>
			<AcceptInvitationClient invitation={invitation} />
		</AuthShell>
	);
}
