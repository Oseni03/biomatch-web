import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueDonorCode } from "@/lib/donor-code";
import { clearSmsOutbox, getSmsOutbox } from "@/lib/sms";
import {
	clearWhatsAppOutbox,
	getWhatsAppOutbox,
	setWhatsAppFakeFailure,
} from "@/lib/whatsapp";
import { recordConsentsForUser } from "@/servers/consent";
import { approveHospital } from "@/servers/admin";
import { createBloodRequest } from "@/servers/requests";
import {
	dispatchNotification,
	getFailedDeliveries,
	getNotificationPreferences,
	handleDeliveryCallback,
	retryFailedDeliveries,
	updateNotificationPreferences,
} from "@/servers/delivery";
import {
	deleteOrganizationCompletely,
	deleteUsersCompletely,
} from "./helpers";

const stamp = Date.now();
const password = "HospitalTest123!";

let adminId = "";
let ownerId = "";
let ownerHeaders = new Headers();
let organizationId = "";
const donors: Record<string, string> = {};
let phoneForVerified = "";

async function signUp(email: string, name: string): Promise<{ userId: string; headers: Headers }> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		headers: new Headers(),
		asResponse: true,
	});
	assert.equal(response.status, 200);
	const data = (await response.json()) as { user?: { id?: string } };
	assert.ok(data?.user?.id);
	const headers = new Headers();
	for (const setCookie of response.headers.getSetCookie()) {
		const pair = setCookie.split(";")[0]?.trim();
		if (pair) headers.append("cookie", pair);
	}
	return { userId: data.user.id as string, headers };
}

async function makeDonor(key: string, verifiedPhone: boolean): Promise<string> {
	const signed = await signUp(`delivery-${key}-17-${stamp}@example.com`, `Donor ${key}`);
	await recordConsentsForUser(signed.userId, {});
	const code = await generateUniqueDonorCode(async (candidate) => {
		const existing = await prisma.donorProfile.findUnique({
			where: { donorCode: candidate },
			select: { userId: true },
		});
		return !!existing;
	});
	await prisma.donorProfile.create({
		data: {
			userId: signed.userId,
			donorCode: code,
			bloodGroup: "O_POS",
			state: "Lagos",
			homeLatitude: 6.5344,
			homeLongitude: 3.3792,
			verificationStatus: "verified",
		},
	});
	if (verifiedPhone) {
		const suffix = String(Math.floor(10000000 + Math.random() * 89999999));
		phoneForVerified = `+23480${suffix}`;
		await prisma.user.update({
			where: { id: signed.userId },
			data: { phoneNumber: phoneForVerified, phoneNumberVerified: true },
		});
	}
	donors[key] = signed.userId;
	return signed.userId;
}

async function latestNotice(userId: string, type: string): Promise<string> {
	const notice = await prisma.notification.findFirst({
		where: { userId, type },
		orderBy: { createdAt: "desc" },
		select: { id: true },
	});
	assert.ok(notice);
	return notice.id;
}

async function deliveriesFor(notificationId: string) {
	return prisma.notificationDelivery.findMany({
		where: { notificationId },
		select: { channel: true, status: true, attempts: true, providerMessageId: true, error: true },
	});
}

describe("Issue 17 multichannel delivery with fallback", () => {
	it("sets up an approved hospital, an admin and two donors", async () => {
		const admin = await signUp(`delivery-admin-17-${stamp}@example.com`, "Delivery Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const owner = await signUp(`delivery-owner-17-${stamp}@example.com`, "Delivery Owner");
		ownerId = owner.userId;
		ownerHeaders = owner.headers;
		await recordConsentsForUser(ownerId, {});

		const organization = await auth.api.createOrganization({
			body: {
				name: `Delivery Hospital ${stamp}`,
				slug: `delivery-hospital-17-${stamp}`,
				officialEmail: `official-17-${stamp}@example.com`,
				registrationNumber: `RC-17-${stamp}`,
				address: "1 Delivery Street, Yaba",
				state: "Lagos",
				latitude: 6.5244,
				longitude: 3.3792,
			},
			headers: ownerHeaders,
		} as Parameters<typeof auth.api.createOrganization>[0]);
		organizationId = organization.id as string;
		await approveHospital(adminId, { organizationId });

		await makeDonor("verified", true);
		await makeDonor("unverified", false);
		clearSmsOutbox();
		clearWhatsAppOutbox();
	});

	it("sends sms, whatsapp and email to a verified-phone donor with the approved template", async () => {
		await createBloodRequest(organizationId, ownerId, {
			bloodGroup: "O_POS",
			unitsRequired: 2,
		});
		const noticeId = await latestNotice(donors.verified as string, "request.new_match");
		const rows = await deliveriesFor(noticeId);
		const byChannel = new Map(rows.map((row) => [String(row.channel), row]));
		assert.equal(String(byChannel.get("sms")?.status), "sent");
		assert.equal(String(byChannel.get("whatsapp")?.status), "sent");
		assert.equal(String(byChannel.get("email")?.status), "sent");
		assert.ok(byChannel.get("sms")?.providerMessageId);

		const sms = getSmsOutbox().filter((entry) => entry.to === phoneForVerified);
		assert.equal(sms.length, 1);
		assert.match(
			sms[0]?.message ?? "",
			/^URGENT: .+ \(.+\) needs blood type .+\. Open your BioMatch app to respond\.$/,
		);
		assert.ok(!(sms[0]?.message ?? "").includes("RC-17"));

		const wa = getWhatsAppOutbox().filter((entry) => entry.to === phoneForVerified);
		assert.equal(wa.length, 1);
		assert.equal(wa[0]?.template, "biomatch_alert");
		assert.equal(wa[0]?.params.length, 3);
	});

	it("sends only in-app and email without a verified phone", async () => {
		const noticeId = await latestNotice(donors.unverified as string, "request.new_match");
		const rows = await deliveriesFor(noticeId);
		const channels = rows.map((row) => String(row.channel)).sort();
		assert.deepEqual(channels, ["email"]);
	});

	it("falls back to sms when whatsapp fails", async () => {
		setWhatsAppFakeFailure(true);
		try {
			const notice = await prisma.notification.create({
				data: {
					userId: donors.verified as string,
					type: "request.new_match",
					title: "Urgent: O+ blood needed near you",
					body: "O+ needed. Open the app to respond.",
					data: {},
				},
				select: { id: true },
			});
			const result = await dispatchNotification(notice.id);
			assert.ok(result.attempted.includes("whatsapp"));
			assert.ok(result.attempted.includes("sms"));
			assert.ok(!result.sent.includes("whatsapp"));
			assert.ok(result.sent.includes("sms"));

			const rows = await deliveriesFor(notice.id);
			const byChannel = new Map(rows.map((row) => [String(row.channel), row]));
			assert.equal(String(byChannel.get("whatsapp")?.status), "failed");
			assert.equal(String(byChannel.get("sms")?.status), "sent");
		} finally {
			setWhatsAppFakeFailure(false);
		}
	});

	it("respects an sms opt-out on fallback and retries within the cap", async () => {
		await updateNotificationPreferences(donors.verified as string, { sms: false });
		setWhatsAppFakeFailure(true);
		let failedId = "";
		try {
			const notice = await prisma.notification.create({
				data: {
					userId: donors.verified as string,
					type: "request.new_match",
					title: "Urgent: O+ blood needed near you",
					body: "O+ needed. Open the app to respond.",
					data: {},
				},
				select: { id: true },
			});
			const result = await dispatchNotification(notice.id);
			assert.ok(!result.attempted.includes("sms"));
			const rows = await deliveriesFor(notice.id);
			const wa = rows.find((row) => String(row.channel) === "whatsapp");
			assert.equal(String(wa?.status), "failed");
			failedId = notice.id;
		} finally {
			setWhatsAppFakeFailure(false);
		}

		const retry = await retryFailedDeliveries();
		assert.ok(retry.sent >= 1);
		const rows = await deliveriesFor(failedId);
		assert.equal(String(rows.find((row) => String(row.channel) === "whatsapp")?.status), "sent");

		const prefs = await getNotificationPreferences(donors.verified as string);
		assert.equal(prefs.sms, false);
		await updateNotificationPreferences(donors.verified as string, { sms: true });
	});

	it("caps retries and surfaces failures for debugging", async () => {
		const notice = await prisma.notification.create({
			data: {
				userId: donors.verified as string,
				type: "request.new_match",
				title: "Retry cap probe",
				body: "Probe body.",
				data: {},
			},
			select: { id: true },
		});
		const stuck = await prisma.notificationDelivery.create({
			data: {
				notificationId: notice.id,
				channel: "sms",
				status: "failed",
				attempts: 3,
				error: "Provider timeout",
			},
			select: { id: true, providerMessageId: true },
		});
		const retry = await retryFailedDeliveries();
		const after = await prisma.notificationDelivery.findUnique({
			where: { id: stuck.id },
			select: { attempts: true, status: true },
		});
		assert.equal(after?.attempts, 3);

		const { total } = await getFailedDeliveries(adminId);
		assert.ok(total >= 1);
		await assert.rejects(getFailedDeliveries(ownerId), /admin access required|not authorized/i);

		const delivered = await handleDeliveryCallback({
			providerMessageId: "fake-1",
			status: "delivered",
			provider: "termii",
		});
		assert.equal(typeof delivered.updated, "boolean");
		const unknown = await handleDeliveryCallback({
			providerMessageId: "no-such-message",
			status: "failed",
		});
		assert.equal(unknown.updated, false);
		void retry;
	});
});

after(async () => {
	setWhatsAppFakeFailure(false);
	await deleteUsersCompletely(
		[adminId, ownerId, donors.verified as string, donors.unverified as string].filter(
			Boolean,
		),
	);
	if (organizationId) {
		await deleteOrganizationCompletely(organizationId);
	}
});
