"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import EmergencyAlertEmail from "@/emails/emergency-alert";
import ScreeningResultEmail from "@/emails/screening-result";

export async function sendEmergencyAlertEmail(alertId: string) {
	const alert = await prisma.emergencyAlert.findUnique({
		where: { id: alertId },
		include: {
			request: {
				include: {
					hospital: {
						select: { id: true, name: true, location: true },
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
		const result = await sendEmail({
			to: alert.donor.email,
			subject: `Urgent Blood Donation Needed - ${alert.request.hospital.name}`,
			react: EmergencyAlertEmail({
				donorName: alert.donor.name,
				hospitalName: alert.request.hospital.name,
				hospitalLocation: alert.request.hospital.location ?? "",
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

	await prisma.notificationLog.create({
		data: {
			alertId,
			channel: "email",
			status: emailError ? "failed" : "sent",
			providerMessageId: messageId,
			errorMessage: emailError,
		},
	});

	if (emailError) {
		console.error("Failed to send emergency alert email:", emailError);
		return { success: false, error: emailError };
	}

	return { success: true, messageId };
}

export async function sendScreeningResultEmail(screeningId: string) {
	const screening = await prisma.donorScreening.findUnique({
		where: { id: screeningId },
		include: {
			donor: { select: { id: true, email: true, name: true } },
		},
	});

	if (!screening) return { success: false, error: "Screening not found" };
	if (!screening.donor.email)
		return { success: false, error: "Donor has no email" };
	if (screening.status === "pending")
		return { success: false, error: "Screening not resolved" };

	try {
		const result = await sendEmail({
			to: screening.donor.email,
			subject:
				screening.status === "passed"
					? "Your Blood Screening Result: Cleared to Donate"
					: "Your Blood Screening Result",
			react: ScreeningResultEmail({
				donorName: screening.donor.name,
				status: screening.status as "passed" | "failed",
				notes: screening.notes,
			}),
		});
		return { success: true, messageId: result.id };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("Failed to send screening result email:", message);
		return { success: false, error: message };
	}
}
