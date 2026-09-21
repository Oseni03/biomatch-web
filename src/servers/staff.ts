"use server";

import { prisma } from "@/lib/prisma";

export interface InvitationPreview {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date;
	organizationName: string;
}

export async function getInvitationPreview(
	invitationId: string,
): Promise<InvitationPreview | null> {
	const invitation = await prisma.invitation.findUnique({
		where: { id: invitationId },
		include: { organization: { select: { name: true } } },
	});
	if (!invitation) return null;

	return {
		id: invitation.id,
		email: invitation.email,
		role: invitation.role ?? "member",
		status: invitation.status,
		expiresAt: invitation.expiresAt,
		organizationName: invitation.organization.name,
	};
}
