"use server";

import { Prisma } from "@generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { COOLDOWN_DAYS, REWARD_CREDIT_KOBO } from "@/lib/config";
import { requireConsentsForUser } from "@/servers/consent";
import { requireOrgPermission } from "@/servers/organization";
import { writeAuditLog } from "@/servers/audit";
import { dispatchNotification } from "@/servers/delivery";
import { notifyHospitalStaff } from "@/servers/responses";

export interface ConfirmationState {
	matchId: string;
	donorConfirmed: boolean;
	hospitalConfirmed: boolean;
	completed: boolean;
}

export interface CompletedDonation {
	donationId: string;
	matchId: string;
	requestId: string;
	hospitalName: string;
	locationName: string;
	bloodGroup: string;
	completedAt: Date;
	rewardKobo: number;
}

async function tryCompleteDonation(donationId: string): Promise<{ completed: boolean }> {
	const donation = await prisma.donation.findUnique({
		where: { id: donationId },
		select: {
			id: true,
			status: true,
			donorConfirmedAt: true,
			hospitalConfirmedAt: true,
			matchId: true,
			requestId: true,
			donorId: true,
			organizationId: true,
		},
	});
	if (
		!donation ||
		String(donation.status) !== "pending" ||
		!donation.donorConfirmedAt ||
		!donation.hospitalConfirmedAt
	) {
		return { completed: false };
	}
	const claimed = await prisma.donation.updateMany({
		where: { id: donation.id, status: "pending" },
		data: { status: "completed", completedAt: new Date() },
	});
	if (claimed.count === 0) {
		return { completed: false };
	}
	const now = new Date();
	const cooldownUntil = new Date(now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
	await prisma.$transaction(async (tx) => {
		await tx.requestMatch.update({
			where: { id: donation.matchId },
			data: { status: "completed", respondedAt: now },
		});
		await tx.donorProfile.update({
			where: { userId: donation.donorId },
			data: { lastDonatedAt: now, cooldownUntil },
		});
		// Balance is maintained by the trg_wallet_apply trigger on insert.
		// Never touch donorWallet here or the reward credits twice.
		try {
			await tx.walletTransaction.create({
				data: {
					donorId: donation.donorId,
					entryType: "donation_reward",
					amountKobo: BigInt(REWARD_CREDIT_KOBO),
					donationId: donation.id,
					description: "Reward for a completed blood donation",
				},
			});
		} catch (caught) {
			if (
				caught instanceof Prisma.PrismaClientKnownRequestError &&
				caught.code === "P2002"
			) {
				return;
			}
			throw caught;
		}
	});

	const request = await prisma.bloodRequest.findUnique({
		where: { id: donation.requestId },
		select: {
			bloodGroup: true,
			locationName: true,
			organization: { select: { name: true } },
		},
	});
	const hospitalName = request?.organization.name ?? "The hospital";
	const donorNotice = await prisma.notification.create({
		data: {
			userId: donation.donorId,
			type: "donation.completed",
			title: "Donation completed — thank you",
			body: `Your donation at ${hospitalName} is confirmed. Your reward has been credited to your wallet.`,
			data: { requestId: donation.requestId, matchId: donation.matchId },
		},
		select: { id: true },
	});
	await dispatchNotification(donorNotice.id).catch(() => undefined);
	await notifyHospitalStaff(
		donation.organizationId,
		donation.requestId,
		donation.matchId,
		"donation.completed",
		"Donation completed",
		`${hospitalName} confirmed a completed donation.`,
	);
	return { completed: true };
}

async function confirmSide(
	matchId: string,
	side: "donor" | "hospital",
	actorUserId: string,
	organizationId?: string,
): Promise<ConfirmationState> {
	const match = await prisma.requestMatch.findUnique({
		where: { id: matchId },
		select: {
			id: true,
			donorId: true,
			status: true,
			requestId: true,
			donation: {
				select: {
					id: true,
					status: true,
					donorConfirmedAt: true,
					hospitalConfirmedAt: true,
				},
			},
		},
	});
	if (!match || !match.donation) {
		throw new Error("Donation not found");
	}
	if (String(match.status) !== "accepted") {
		throw new Error("Only an accepted donation can be confirmed");
	}
	if (side === "donor" && match.donorId !== actorUserId) {
		throw new Error("Match not found");
	}
	const field = side === "donor" ? "donorConfirmedAt" : "hospitalConfirmedAt";
	if (!match.donation[field]) {
		await prisma.donation.update({
			where: { id: match.donation.id },
			data: {
				[field]: new Date(),
				...(side === "hospital" && organizationId
					? { hospitalConfirmedBy: actorUserId }
					: {}),
			},
		});
	}
	const { completed } = await tryCompleteDonation(match.donation.id);
	await writeAuditLog({
		actorId: actorUserId,
		...(organizationId ? { organizationId } : {}),
		action: side === "donor" ? "donation.donor_confirmed" : "donation.hospital_confirmed",
		entityType: "donation",
		entityId: match.donation.id,
		metadata: { requestId: match.requestId, matchId, completed },
	});
	const refreshed = await prisma.donation.findUnique({
		where: { id: match.donation.id },
		select: { donorConfirmedAt: true, hospitalConfirmedAt: true, status: true },
	});
	return {
		matchId,
		donorConfirmed: !!refreshed?.donorConfirmedAt,
		hospitalConfirmed: !!refreshed?.hospitalConfirmedAt,
		completed: String(refreshed?.status) === "completed",
	};
}

export async function confirmDonationByDonor(
	matchId: string,
	donorUserId: string,
): Promise<ConfirmationState> {
	await requireConsentsForUser(donorUserId);
	return confirmSide(matchId, "donor", donorUserId);
}

export async function confirmDonationByHospital(
	organizationId: string,
	callerUserId: string,
	matchId: string,
): Promise<ConfirmationState> {
	await requireConsentsForUser(callerUserId);
	await requireOrgPermission(organizationId, callerUserId, {
		donor: ["confirmDonation"],
	});
	const match = await prisma.requestMatch.findUnique({
		where: { id: matchId },
		select: { request: { select: { organizationId: true } } },
	});
	if (!match || match.request.organizationId !== organizationId) {
		throw new Error("Donation not found");
	}
	return confirmSide(matchId, "hospital", callerUserId, organizationId);
}

export async function getMyDonations(
	donorUserId: string,
	filters?: { page?: number; pageSize?: number },
): Promise<{ donations: CompletedDonation[]; total: number }> {
	await requireConsentsForUser(donorUserId);
	const page = Math.max(1, filters?.page ?? 1);
	const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
	const where = { donorId: donorUserId, status: "completed" as const };
	const [total, rows] = await Promise.all([
		prisma.donation.count({ where }),
		prisma.donation.findMany({
			where,
			orderBy: { completedAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				matchId: true,
				requestId: true,
				completedAt: true,
				request: {
					select: {
						bloodGroup: true,
						locationName: true,
						organization: { select: { name: true } },
					},
				},
			},
		}),
	]);
	const donationIds = rows.map((row) => row.id);
	const rewards = await prisma.walletTransaction.findMany({
		where: { donationId: { in: donationIds }, entryType: "donation_reward" },
		select: { donationId: true, amountKobo: true },
	});
	const rewardByDonation = new Map(
		rewards.map((reward) => [reward.donationId as string, Number(reward.amountKobo)]),
	);
	return {
		donations: rows.map((row) => ({
			donationId: row.id,
			matchId: row.matchId,
			requestId: row.requestId,
			hospitalName: row.request.organization.name,
			locationName: row.request.locationName,
			bloodGroup: String(row.request.bloodGroup).replace("_", " "),
			completedAt: row.completedAt ?? new Date(),
			rewardKobo: rewardByDonation.get(row.id) ?? 0,
		})),
		total,
	};
}
