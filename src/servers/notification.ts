"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import EmergencyAlertEmail from "@/emails/emergency-alert";

export async function sendEmergencyAlertEmail(alertId: string) {
	const alert = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		include: {
			request: {
				include: {
					organization: {
						select: {
							id: true,
							name: true,
							hospitalBanks: { select: { location: true }, take: 1 },
						},
					},
				},
			},
			donor: {
				select: { id: true, email: true, name: true },
			},
		},
	});

	if (!alert) return { success: false, error: "Alert not found" };
	if (!alert.donor.email)
		return { success: false, error: "Donor has no email" };

	let messageId: string | null = null;
	let emailError: string | null = null;

	try {
		const hospitalName = alert.request.organization?.name ?? "Unknown";
		const hospitalLocation =
			alert.request.organization?.hospitalBanks[0]?.location ?? "";

		const result = await sendEmail({
			to: alert.donor.email,
			subject: `Urgent Blood Donation Needed - ${hospitalName}`,
			react: EmergencyAlertEmail({
				donorName: alert.donor.name,
				hospitalName,
				hospitalLocation,
				bloodGroup: alert.request.bloodGroup,
				urgencyLevel: alert.request.urgencyLevel,
				distance: "Nearby",
				acceptUrl: `${process.env.BETTER_AUTH_URL}/donor?alert=${alert.id}`,
			}),
		});

		messageId = result.id;
	} catch (err) {
		emailError = err instanceof Error ? err.message : "Unknown error";
	}

	if (emailError) {
		console.error("Failed to send emergency alert email:", emailError);
		return { success: false, error: emailError };
	}

	return { success: true, messageId };
}
