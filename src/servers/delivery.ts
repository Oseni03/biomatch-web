"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DELIVERY_MAX_ATTEMPTS } from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { sendWhatsApp } from "@/lib/whatsapp";
import NotificationEmail from "@/emails/notification-email";
import { requireAdmin } from "@/servers/admin";
import { requireConsentsForUser } from "@/servers/consent";

export type DeliveryChannel = "sms" | "whatsapp" | "email";

const ALL_CHANNELS: DeliveryChannel[] = ["sms", "whatsapp", "email"];

interface Recipient {
	userId: string;
	email: string;
	phoneNumber: string | null;
	phoneVerified: boolean;
	notifySms: boolean;
	notifyWhatsapp: boolean;
	notifyEmail: boolean;
}

interface AlertContext {
	title: string;
	body: string;
	smsText: string;
	whatsappParams: string[];
}

async function buildAlertContext(
	notification: { type: string; title: string; body: string; data: unknown },
): Promise<AlertContext> {
	const fallback = {
		title: notification.title,
		body: notification.body,
		smsText: `${notification.title} — ${notification.body}`,
		whatsappParams: [notification.title, notification.body],
	};
	const data = notification.data as { requestId?: string } | null;
	if (!data?.requestId) return fallback;
	const request = await prisma.bloodRequest.findUnique({
		where: { id: data.requestId },
		select: {
			bloodGroup: true,
			locationName: true,
			organization: { select: { name: true } },
		},
	});
	if (!request) return fallback;
	const group = String(request.bloodGroup).replace("_", " ");
	const hospital = request.organization.name;
	const location = request.locationName;
	return {
		title: notification.title,
		body: notification.body,
		smsText: `URGENT: ${hospital} (${location}) needs blood type ${group}. Open your BioMatch app to respond.`,
		whatsappParams: [hospital, location, group],
	};
}

async function attemptChannel(
	deliveryId: string,
	channel: DeliveryChannel,
	recipient: Recipient,
	alert: AlertContext,
): Promise<boolean> {
	try {
		let providerId: string;
		if (channel === "sms") {
			const sent = await sendSms({
				to: recipient.phoneNumber as string,
				message: alert.smsText,
			});
			providerId = sent.id;
		} else if (channel === "whatsapp") {
			const sent = await sendWhatsApp({
				to: recipient.phoneNumber as string,
				template: "biomatch_alert",
				params: alert.whatsappParams,
			});
			providerId = sent.id;
		} else {
			const sent = await sendEmail({
				to: recipient.email,
				subject: alert.title,
				react: NotificationEmail({ title: alert.title, body: alert.body }),
			});
			providerId = sent.id;
		}
		await prisma.notificationDelivery.update({
			where: { id: deliveryId },
			data: {
				status: "sent",
				provider: channel === "email" ? "resend" : channel === "sms" ? "termii" : "whatsapp",
				providerMessageId: providerId,
				sentAt: new Date(),
				error: null,
			},
		});
		return true;
	} catch (caught) {
		await prisma.notificationDelivery.update({
			where: { id: deliveryId },
			data: {
				status: "failed",
				error: caught instanceof Error ? caught.message : "Send failed",
			},
		});
		return false;
	}
}

async function ensureDeliveryRow(
	notificationId: string,
	channel: DeliveryChannel,
): Promise<string | null> {
	try {
		const row = await prisma.notificationDelivery.create({
			data: { notificationId, channel, status: "queued" },
			select: { id: true },
		});
		return row.id;
	} catch {
		return null;
	}
}

// Creates one delivery row per eligible channel for an in-app notification
// and attempts each immediately. SMS/WhatsApp require a verified phone;
// every channel respects the recipient's notify flags. A WhatsApp failure
// falls back to SMS unless the recipient disabled SMS explicitly. Donation
// completion (issue 18) reuses this by dispatching its own notifications.
export async function dispatchNotification(
	notificationId: string,
	options?: { channels?: DeliveryChannel[] },
): Promise<{ attempted: DeliveryChannel[]; sent: DeliveryChannel[] }> {
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: {
			type: true,
			title: true,
			body: true,
			data: true,
			user: {
				select: {
					id: true,
					email: true,
					phoneNumber: true,
					phoneNumberVerified: true,
					notifySms: true,
					notifyWhatsapp: true,
					notifyEmail: true,
				},
			},
		},
	});
	if (!notification) {
		throw new Error("Notification not found");
	}
	const recipient: Recipient = {
		userId: notification.user.id,
		email: notification.user.email,
		phoneNumber: notification.user.phoneNumber,
		phoneVerified: notification.user.phoneNumberVerified === true,
		notifySms: notification.user.notifySms,
		notifyWhatsapp: notification.user.notifyWhatsapp,
		notifyEmail: notification.user.notifyEmail,
	};
	const wanted = new Set(options?.channels ?? ALL_CHANNELS);
	const alert = await buildAlertContext(notification);
	const attempted: DeliveryChannel[] = [];
	const sent: DeliveryChannel[] = [];

	if (wanted.has("email") && recipient.notifyEmail) {
		const rowId = await ensureDeliveryRow(notificationId, "email");
		if (rowId) {
			attempted.push("email");
			await prisma.notificationDelivery.update({
				where: { id: rowId },
				data: { attempts: { increment: 1 } },
			});
			if (await attemptChannel(rowId, "email", recipient, alert)) {
				sent.push("email");
			}
		}
	}

	const canText = recipient.phoneNumber && recipient.phoneVerified;
	let smsRowId: string | null = null;
	if (wanted.has("sms") && recipient.notifySms && canText) {
		smsRowId = await ensureDeliveryRow(notificationId, "sms");
		if (smsRowId) {
			attempted.push("sms");
			await prisma.notificationDelivery.update({
				where: { id: smsRowId },
				data: { attempts: { increment: 1 } },
			});
			if (await attemptChannel(smsRowId, "sms", recipient, alert)) {
				sent.push("sms");
			}
		}
	}

	if (wanted.has("whatsapp") && recipient.notifyWhatsapp && canText) {
		const rowId = await ensureDeliveryRow(notificationId, "whatsapp");
		if (rowId) {
			attempted.push("whatsapp");
			await prisma.notificationDelivery.update({
				where: { id: rowId },
				data: { attempts: { increment: 1 } },
			});
			const ok = await attemptChannel(rowId, "whatsapp", recipient, alert);
			if (ok) {
				sent.push("whatsapp");
			} else if (!smsRowId && recipient.notifySms) {
				const fallbackId = await ensureDeliveryRow(notificationId, "sms");
				if (fallbackId) {
					attempted.push("sms");
					await prisma.notificationDelivery.update({
						where: { id: fallbackId },
						data: { attempts: { increment: 1 } },
					});
					if (await attemptChannel(fallbackId, "sms", recipient, alert)) {
						sent.push("sms");
					}
				}
			}
		}
	}

	return { attempted, sent };
}

// Retries failed deliveries up to the configured attempt cap. WhatsApp
// retries that fail again fall back to SMS under the same rules as dispatch.
export async function retryFailedDeliveries(
	limit = 50,
): Promise<{ retried: number; sent: number }> {
	const failed = await prisma.notificationDelivery.findMany({
		where: { status: "failed", attempts: { lt: DELIVERY_MAX_ATTEMPTS } },
		orderBy: { createdAt: "asc" },
		take: Math.max(1, Math.min(200, limit)),
		select: {
			id: true,
			channel: true,
			notificationId: true,
			notification: {
				select: {
					title: true,
					body: true,
					type: true,
					data: true,
					user: {
						select: {
							id: true,
							email: true,
							phoneNumber: true,
							phoneNumberVerified: true,
							notifySms: true,
							notifyWhatsapp: true,
							notifyEmail: true,
						},
					},
				},
			},
		},
	});
	let sent = 0;
	for (const row of failed) {
		const channel = row.channel as DeliveryChannel;
		const recipient: Recipient = {
			userId: row.notification.user.id,
			email: row.notification.user.email,
			phoneNumber: row.notification.user.phoneNumber,
			phoneVerified: row.notification.user.phoneNumberVerified === true,
			notifySms: row.notification.user.notifySms,
			notifyWhatsapp: row.notification.user.notifyWhatsapp,
			notifyEmail: row.notification.user.notifyEmail,
		};
		if (
			(channel === "sms" || channel === "whatsapp") &&
			!(recipient.phoneNumber && recipient.phoneVerified)
		) {
			continue;
		}
		const alert = await buildAlertContext(row.notification);
		await prisma.notificationDelivery.update({
			where: { id: row.id },
			data: { status: "queued", attempts: { increment: 1 } },
		});
		const ok = await attemptChannel(row.id, channel, recipient, alert);
		if (ok) {
			sent += 1;
		} else if (channel === "whatsapp" && recipient.notifySms) {
			const existing = await prisma.notificationDelivery.findUnique({
				where: {
					notificationId_channel: {
						notificationId: row.notificationId,
						channel: "sms",
					},
				},
				select: { id: true, status: true },
			});
			if (!existing) {
				const fallback = await dispatchNotification(row.notificationId, {
					channels: ["sms"],
				});
				sent += fallback.sent.length;
			}
		}
	}
	return { retried: failed.length, sent };
}

export async function handleDeliveryCallback(input: {
	providerMessageId: string;
	status: "delivered" | "failed";
	provider?: string;
	error?: string;
}): Promise<{ updated: boolean }> {
	const row = await prisma.notificationDelivery.findFirst({
		where: { providerMessageId: input.providerMessageId },
		select: { id: true },
	});
	if (!row) return { updated: false };
	await prisma.notificationDelivery.update({
		where: { id: row.id },
		data:
			input.status === "delivered"
				? {
						status: "delivered",
						deliveredAt: new Date(),
						...(input.provider ? { provider: input.provider } : {}),
					}
				: {
						status: "failed",
						error: input.error ?? "Provider reported failure",
					},
	});
	return { updated: true };
}

export interface FailedDelivery {
	deliveryId: string;
	channel: string;
	status: string;
	attempts: number;
	error: string | null;
	createdAt: Date;
	recipient: string;
	title: string;
}

export async function getFailedDeliveries(
	adminUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<{ deliveries: FailedDelivery[]; total: number }> {
	await requireAdmin(adminUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
	const where = { status: "failed" as const };
	const [total, rows] = await Promise.all([
		prisma.notificationDelivery.count({ where }),
		prisma.notificationDelivery.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				channel: true,
				status: true,
				attempts: true,
				error: true,
				createdAt: true,
				notification: {
					select: {
						title: true,
						user: { select: { name: true, email: true } },
					},
				},
			},
		}),
	]);
	return {
		deliveries: rows.map((row) => ({
			deliveryId: row.id,
			channel: String(row.channel),
			status: String(row.status),
			attempts: row.attempts,
			error: row.error,
			createdAt: row.createdAt,
			recipient: `${row.notification.user.name} <${row.notification.user.email}>`,
			title: row.notification.title,
		})),
		total,
	};
}

const preferencesSchema = z.object({
	sms: z.boolean().optional(),
	whatsapp: z.boolean().optional(),
	email: z.boolean().optional(),
	push: z.boolean().optional(),
});

export async function getNotificationPreferences(userId: string): Promise<{
	sms: boolean;
	whatsapp: boolean;
	email: boolean;
	push: boolean;
}> {
	await requireConsentsForUser(userId);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			notifySms: true,
			notifyWhatsapp: true,
			notifyEmail: true,
			notifyPush: true,
		},
	});
	if (!user) throw new Error("User not found");
	return {
		sms: user.notifySms,
		whatsapp: user.notifyWhatsapp,
		email: user.notifyEmail,
		push: user.notifyPush,
	};
}

export async function updateNotificationPreferences(
	userId: string,
	rawInput: unknown,
): Promise<{ sms: boolean; whatsapp: boolean; email: boolean; push: boolean }> {
	await requireConsentsForUser(userId);
	const input = preferencesSchema.parse(rawInput);
	const user = await prisma.user.update({
		where: { id: userId },
		data: {
			...(input.sms === undefined ? {} : { notifySms: input.sms }),
			...(input.whatsapp === undefined ? {} : { notifyWhatsapp: input.whatsapp }),
			...(input.email === undefined ? {} : { notifyEmail: input.email }),
			...(input.push === undefined ? {} : { notifyPush: input.push }),
		},
		select: {
			notifySms: true,
			notifyWhatsapp: true,
			notifyEmail: true,
			notifyPush: true,
		},
	});
	return {
		sms: user.notifySms,
		whatsapp: user.notifyWhatsapp,
		email: user.notifyEmail,
		push: user.notifyPush,
	};
}
