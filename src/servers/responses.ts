"use server";

import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { requireConsentsForUser } from "@/servers/consent";
import { requireOrgPermission } from "@/servers/organization";
import { writeAuditLog } from "@/servers/audit";

export interface AcceptResult {
	matchId: string;
	status: "accepted" | "filled";
	unitsAccepted: number;
	requestStatus: string;
}

export interface DonorResponse {
	matchId: string;
	requestId: string;
	status: string;
	bloodGroup: string;
	hospitalName: string;
	locationName: string;
	distanceKm: number;
	unitsRequired: number;
	respondedAt: Date | null;
}

export interface DonorViewMatch {
	matchId: string;
	status: string;
	bloodGroup: string;
	distanceKm: number;
	notifiedAt: Date;
	respondedAt: Date | null;
	donor: {
		name: string;
		donorCode: string;
		phoneNumber: string | null;
	} | null;
}

async function assertDonorEligible(donorId: string): Promise<void> {
	const profile = await prisma.donorProfile.findUnique({
		where: { userId: donorId },
		select: {
			verificationStatus: true,
			donorStatus: true,
			isAvailable: true,
			cooldownUntil: true,
			user: { select: { banned: true } },
		},
	});
	if (
		!profile ||
		String(profile.verificationStatus) !== "verified" ||
		String(profile.donorStatus) !== "active" ||
		!profile.isAvailable ||
		(profile.cooldownUntil && profile.cooldownUntil > new Date()) ||
		profile.user.banned
	) {
		throw new Error("You are not currently eligible to accept this request");
	}
}

async function notifyHospitalStaff(
	organizationId: string,
	requestId: string,
	matchId: string,
	type: string,
	title: string,
	body: string,
): Promise<void> {
	const members = await prisma.member.findMany({
		where: { organizationId },
		select: { userId: true, role: true },
	});
	const request = await prisma.bloodRequest.findUnique({
		where: { id: requestId },
		select: { createdById: true },
	});
	const recipients = new Set<string>();
	if (request) recipients.add(request.createdById);
	for (const member of members) {
		const roles = member.role.split(",").map((role) => role.trim());
		if (roles.includes("owner") || roles.includes("admin")) {
			recipients.add(member.userId);
		}
	}
	if (recipients.size === 0) return;
	await prisma.notification.createMany({
		data: [...recipients].map((userId) => ({
			userId,
			type,
			title,
			body,
			data: { requestId, matchId },
		})),
	});
}

async function markMatchFilled(
	matchId: string,
	requestId: string,
	donorUserId: string,
	bloodGroup: string,
	hospitalName: string,
): Promise<AcceptResult> {
	await prisma.requestMatch.updateMany({
		where: { id: matchId, status: "notified" },
		data: { status: "filled", respondedAt: new Date() },
	});
	await prisma.notification.create({
		data: {
			userId: donorUserId,
			type: "request.filled",
			title: "Request filled",
			body: `This request for ${formatBloodGroup(bloodGroup)} at ${hospitalName} has received enough donors. Thank you for staying ready.`,
			data: { requestId, matchId },
		},
	});
	const refreshed = await prisma.bloodRequest.findUnique({
		where: { id: requestId },
		select: { unitsAccepted: true, status: true },
	});
	return {
		matchId,
		status: "filled",
		unitsAccepted: refreshed?.unitsAccepted ?? 0,
		requestStatus: String(refreshed?.status ?? "active"),
	};
}

// Single atomic operation (see prisma/biomatch_constraints.sql backend note
// 1): the counter increments only while accepted units are below required,
// so simultaneous accepts can never overfill. Losers become 'filled'.
export async function acceptMatch(
	matchId: string,
	donorUserId: string,
): Promise<AcceptResult> {
	await requireConsentsForUser(donorUserId);
	const match = await prisma.requestMatch.findUnique({
		where: { id: matchId },
		select: {
			id: true,
			donorId: true,
			status: true,
			requestId: true,
			request: {
				select: {
					status: true,
					bloodGroup: true,
					organization: { select: { name: true } },
				},
			},
		},
	});
	if (!match || match.donorId !== donorUserId) {
		throw new Error("Match not found");
	}
	const requestStatus = String(match.request.status);
	if (String(match.status) === "accepted") {
		const current = await prisma.bloodRequest.findUnique({
			where: { id: match.requestId },
			select: { unitsAccepted: true, status: true },
		});
		return {
			matchId,
			status: "accepted",
			unitsAccepted: current?.unitsAccepted ?? 0,
			requestStatus: String(current?.status ?? requestStatus),
		};
	}
	if (String(match.status) !== "notified" || requestStatus !== "active") {
		return markMatchFilled(
			matchId,
			match.requestId,
			donorUserId,
			String(match.request.bloodGroup),
			match.request.organization.name,
		);
	}
	await assertDonorEligible(donorUserId);

	const claimed = await prisma.$queryRaw<{ id: string; unitsAccepted: number; status: string }[]>(
		Prisma.sql`
      UPDATE blood_requests
         SET "unitsAccepted" = "unitsAccepted" + 1,
             status = CASE WHEN "unitsAccepted" + 1 >= "unitsRequired"
                           THEN 'fulfilled'::request_status ELSE status END
       WHERE id = ${match.requestId}::uuid
         AND status = 'active'
         AND "unitsAccepted" < "unitsRequired"
     RETURNING id, "unitsAccepted", status::text AS status`,
	);
	if (claimed.length === 0) {
		return markMatchFilled(
			matchId,
			match.requestId,
			donorUserId,
			String(match.request.bloodGroup),
			match.request.organization.name,
		);
	}

	const outcome = claimed[0] as { id: string; unitsAccepted: number; status: string };
	await prisma.$transaction(async (tx) => {
		await tx.requestMatch.update({
			where: { id: matchId },
			data: { status: "accepted", respondedAt: new Date() },
		});
		await tx.donation.create({
			data: {
				matchId,
				requestId: match.requestId,
				donorId: donorUserId,
				organizationId: (
					await tx.bloodRequest.findUniqueOrThrow({
						where: { id: match.requestId },
						select: { organizationId: true },
					})
				).organizationId,
				status: "pending",
			},
		});
		if (outcome.status === "fulfilled") {
			const waiting = await tx.requestMatch.findMany({
				where: { requestId: match.requestId, status: "notified" },
				select: { id: true, donorId: true },
			});
			const others = waiting.filter((row) => row.id !== matchId);
			if (others.length > 0) {
				await tx.requestMatch.updateMany({
					where: { id: { in: others.map((row) => row.id) } },
					data: { respondedAt: new Date(), status: "filled" },
				});
				await tx.notification.createMany({
					data: others.map((row) => ({
						userId: row.donorId,
						type: "request.filled",
						title: "Request filled",
						body: `This request for ${formatBloodGroup(String(match.request.bloodGroup))} at ${match.request.organization.name} has received enough donors. Thank you for staying ready.`,
						data: { requestId: match.requestId, matchId: row.id },
					})),
				});
			}
		}
	});
	await notifyHospitalStaff(
		(
			await prisma.bloodRequest.findUniqueOrThrow({
				where: { id: match.requestId },
				select: { organizationId: true },
			})
		).organizationId,
		match.requestId,
		matchId,
		"request.donor_accepted",
		"A donor accepted your request",
		`A donor accepted your request for ${formatBloodGroup(String(match.request.bloodGroup))}. Open the donor view to prepare for arrival.`,
	);
	await writeAuditLog({
		actorId: donorUserId,
		action: "request.accept",
		entityType: "request_match",
		entityId: matchId,
		metadata: { requestId: match.requestId },
	});
	return {
		matchId,
		status: "accepted",
		unitsAccepted: outcome.unitsAccepted,
		requestStatus: outcome.status,
	};
}

// Withdrawing decrements the counter and reopens the request. Matches that
// were marked filled by the fulfillment flip back to notified (without a new
// notification — those donors already know the request) so the request can
// fill again. The pending donation never happened and is removed; the audit
// trail records the withdrawal.
export async function withdrawMatch(
	matchId: string,
	donorUserId: string,
): Promise<{ matchId: string; unitsAccepted: number; requestStatus: string }> {
	await requireConsentsForUser(donorUserId);
	const match = await prisma.requestMatch.findUnique({
		where: { id: matchId },
		select: { id: true, donorId: true, status: true, requestId: true },
	});
	if (!match || match.donorId !== donorUserId) {
		throw new Error("Match not found");
	}
	if (String(match.status) !== "accepted") {
		throw new Error("Only an accepted match can be withdrawn");
	}
	const outcome = await prisma.$transaction(async (tx) => {
		await tx.donation.deleteMany({ where: { matchId } });
		await tx.requestMatch.update({
			where: { id: matchId },
			data: { status: "notified", respondedAt: null },
		});
		const updated = await tx.bloodRequest.update({
			where: { id: match.requestId },
			data: {
				unitsAccepted: { decrement: 1 },
				status: "active",
			},
			select: { unitsAccepted: true, status: true },
		});
		await tx.requestMatch.updateMany({
			where: { requestId: match.requestId, status: "filled" },
			data: { status: "notified", respondedAt: null },
		});
		return updated;
	});
	await writeAuditLog({
		actorId: donorUserId,
		action: "request.withdraw",
		entityType: "request_match",
		entityId: matchId,
		metadata: { requestId: match.requestId },
	});
	return {
		matchId,
		unitsAccepted: outcome.unitsAccepted,
		requestStatus: String(outcome.status),
	};
}

export async function getMyResponses(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<{ responses: DonorResponse[]; total: number }> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
	const where = {
		donorId: donorUserId,
		status: { in: ["accepted", "completed"] as const },
	};
	const [total, rows] = await Promise.all([
		prisma.requestMatch.count({ where }),
		prisma.requestMatch.findMany({
			where,
			orderBy: { respondedAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				requestId: true,
				status: true,
				distanceKm: true,
				respondedAt: true,
				request: {
					select: {
						bloodGroup: true,
						locationName: true,
						unitsRequired: true,
						organization: { select: { name: true } },
					},
				},
			},
		}),
	]);
	return {
		total,
		responses: rows.map((row) => ({
			matchId: row.id,
			requestId: row.requestId,
			status: String(row.status),
			bloodGroup: formatBloodGroup(String(row.request.bloodGroup)),
			hospitalName: row.request.organization.name,
			locationName: row.request.locationName,
			distanceKm: Number(row.distanceKm),
			unitsRequired: row.request.unitsRequired,
			respondedAt: row.respondedAt,
		})),
	};
}

// Hospital Donor View: matched donors with response status. Contact details
// (name, code, phone) are revealed only after the donor accepts; waiting
// donors stay anonymous beyond blood group and distance.
export async function getRequestDonorView(
	organizationId: string,
	callerUserId: string,
	requestId: string,
): Promise<{ requestId: string; status: string; matches: DonorViewMatch[] }> {
	await requireConsentsForUser(callerUserId);
	await requireOrgPermission(organizationId, callerUserId, {
		bloodRequest: ["read"],
	});
	const request = await prisma.bloodRequest.findFirst({
		where: { id: requestId, organizationId },
		select: {
			id: true,
			status: true,
			matches: {
				orderBy: { notifiedAt: "asc" },
				select: {
					id: true,
					status: true,
					distanceKm: true,
					notifiedAt: true,
					respondedAt: true,
					donor: {
						select: {
							donorCode: true,
							bloodGroup: true,
							user: { select: { name: true, phoneNumber: true } },
						},
					},
				},
			},
		},
	});
	if (!request) {
		throw new Error("Blood request not found");
	}
	return {
		requestId: request.id,
		status: String(request.status),
		matches: request.matches.map((match) => ({
			matchId: match.id,
			status: String(match.status),
			bloodGroup: formatBloodGroup(String(match.donor.bloodGroup)),
			distanceKm: Number(match.distanceKm),
			notifiedAt: match.notifiedAt,
			respondedAt: match.respondedAt,
			donor:
				String(match.status) === "accepted" || String(match.status) === "completed"
					? {
							name: match.donor.user.name,
							donorCode: match.donor.donorCode,
							phoneNumber: match.donor.user.phoneNumber,
						}
					: null,
		})),
	};
}
