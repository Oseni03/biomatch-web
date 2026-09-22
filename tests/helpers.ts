import { prisma } from "@/lib/prisma";

// Test-only cleanup helpers. Better Auth relations intentionally lack
// database cascades (audit references must survive deletion), so tests must
// delete child rows in dependency order. Every test file's after() hook
// should use these instead of deleting organizations/users directly.

export async function deleteOrganizationCompletely(
	organizationId: string,
): Promise<void> {
	await prisma.donation.deleteMany({ where: { organizationId } });
	await prisma.requestMatch.deleteMany({
		where: { request: { organizationId } },
	});
	await prisma.bloodRequest.deleteMany({ where: { organizationId } });
	await prisma.donorScreening.deleteMany({ where: { organizationId } });
	await prisma.organization
		.delete({ where: { id: organizationId } })
		.catch(() => {});
}

export async function deleteUserCompletely(userId: string): Promise<void> {
	await prisma.walletTransaction.deleteMany({ where: { donorId: userId } });
	await prisma.voucherRedemption.deleteMany({ where: { donorId: userId } });
	await prisma.donation.deleteMany({ where: { donorId: userId } });
	await prisma.requestMatch.deleteMany({ where: { donorId: userId } });
	await prisma.donorScreening.deleteMany({ where: { donorId: userId } });
	await prisma.donorWallet.deleteMany({ where: { donorId: userId } });
	await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

export async function deleteUsersCompletely(userIds: (string | undefined)[]): Promise<void> {
	for (const userId of userIds) {
		if (userId) {
			await deleteUserCompletely(userId);
		}
	}
}
