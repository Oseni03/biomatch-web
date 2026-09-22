import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsentsForUser } from "@/servers/consent";
import {
	addMerchantStaff,
	createMerchant,
	getMerchantPortalContext,
	listActiveMerchants,
	listMerchants,
	setMerchantActive,
	setMerchantStaffActive,
	updateMerchant,
} from "@/servers/merchants";
import { deleteUsersCompletely } from "./helpers";

const stamp = Date.now();
const password = "MerchantTest123!";

let adminId = "";
let staffUserId = "";
let donorId = "";
let merchantId = "";
let staffLinkId = "";

async function signUp(email: string, name: string): Promise<{ userId: string }> {
	const response = await auth.api.signUpEmail({
		body: { email, password, name },
		headers: new Headers(),
		asResponse: true,
	});
	assert.equal(response.status, 200);
	const data = (await response.json()) as { user?: { id?: string } };
	assert.ok(data?.user?.id);
	return { userId: data.user.id as string };
}

describe("Issue 20 admin merchant management", () => {
	it("sets up an admin, a staff user and a donor", async () => {
		const admin = await signUp(`merchant-admin-20-${stamp}@example.com`, "Merchant Admin");
		adminId = admin.userId;
		await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
		await recordConsentsForUser(adminId, {});

		const staff = await signUp(`merchant-staff-20-${stamp}@example.com`, "Mart Cashier");
		staffUserId = staff.userId;
		await recordConsentsForUser(staffUserId, {});

		const donor = await signUp(`merchant-donor-20-${stamp}@example.com`, "Merchant Donor");
		donorId = donor.userId;
		await recordConsentsForUser(donorId, {});
	});

	it("creates and edits a merchant", async () => {
		const created = await createMerchant(adminId, {
			name: `FreshMart ${stamp}`,
			category: "mart",
			address: "1 Market Road, Yaba",
		});
		merchantId = created.id;
		assert.ok(merchantId);

		await updateMerchant(adminId, merchantId, { name: `FreshMart Plus ${stamp}` });
		const listed = await listMerchants(adminId, { includeInactive: true });
		assert.ok(listed.merchants.some((merchant) => merchant.id === merchantId));
		assert.equal(
			listed.merchants.find((merchant) => merchant.id === merchantId)?.name,
			`FreshMart Plus ${stamp}`,
		);
	});

	it("links staff, blocks duplicates and toggles access", async () => {
		const linked = await addMerchantStaff(adminId, merchantId, staffUserId);
		staffLinkId = linked.staffId;
		assert.ok(staffLinkId);

		await assert.rejects(addMerchantStaff(adminId, merchantId, staffUserId));

		const context = await getMerchantPortalContext(staffUserId);
		assert.equal(context?.merchantId, merchantId);

		await setMerchantStaffActive(adminId, staffLinkId, false);
		assert.equal(await getMerchantPortalContext(staffUserId), null);

		await setMerchantStaffActive(adminId, staffLinkId, true);
		assert.equal((await getMerchantPortalContext(staffUserId))?.merchantId, merchantId);
	});

	it("deactivated merchants are hidden from new redemptions", async () => {
		await setMerchantActive(adminId, merchantId, false);
		assert.deepEqual(await listActiveMerchants(donorId), []);
		const hidden = await listMerchants(adminId, {});
		assert.ok(hidden.merchants.every((merchant) => merchant.id !== merchantId));
		const shown = await listMerchants(adminId, { includeInactive: true });
		assert.ok(shown.merchants.some((merchant) => merchant.id === merchantId));
		await setMerchantActive(adminId, merchantId, true);
		assert.equal((await listActiveMerchants(donorId)).length, 1);
	});

	it("rejects non-admin callers", async () => {
		await assert.rejects(listMerchants(donorId, {}));
		await assert.rejects(createMerchant(donorId, { name: "Nope Mart" }));
		await assert.rejects(addMerchantStaff(donorId, merchantId, staffUserId));
	});

	after(async () => {
		await prisma.merchantStaff.deleteMany({ where: { merchantId } }).catch(() => undefined);
		await prisma.merchant.deleteMany({ where: { id: merchantId } }).catch(() => undefined);
		await deleteUsersCompletely([adminId, staffUserId, donorId]);
	});
});
