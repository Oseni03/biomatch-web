import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET as healthGET } from "@/app/api/health/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const email = `skeleton-${Date.now()}@example.com`;
const password = "SkeletonTest123!";
let userId = "";
let sessionToken = "";

describe("Issue 03 walking skeleton", () => {
	it("health endpoint returns ok", async () => {
		const res = await healthGET();
		assert.equal(res.status, 200);
		const body = (await res.json()) as { status: string };
		assert.equal(body.status, "ok");
	});

	it("donor can sign up through the Next.js server layer", async () => {
		const result = await auth.api.signUpEmail({
			body: { email, password, name: "Skeleton Donor" },
		});
		assert.ok(result?.user?.id);
		userId = result.user.id;
		const row = await prisma.user.findUnique({ where: { id: userId } });
		assert.equal(row?.email, email);
	});

	it("donor can sign in and receives a persisted session token", async () => {
		const result = await auth.api.signInEmail({ body: { email, password } });
		assert.ok(result?.token);
		assert.equal(result?.user?.id, userId);
		sessionToken = result.token;
		const sessionRow = await prisma.session.findFirst({
			where: { userId, token: sessionToken },
		});
		assert.ok(sessionRow);
	});

	it("session retrieval returns the signed-in donor", async () => {
		const session = await auth.api.getSession({
			headers: new Headers({
				cookie: `better-auth.session_token=${sessionToken}`,
			}),
		});
		assert.equal(session?.user?.id, userId);
		assert.equal(session?.user?.email, email);
	});

	after(async () => {
		if (userId) {
			await prisma.session.deleteMany({ where: { userId } });
			await prisma.account.deleteMany({ where: { userId } });
			await prisma.user.delete({ where: { id: userId } }).catch(() => {});
		}
		await prisma.verification
			.deleteMany({ where: { identifier: { contains: email } } })
			.catch(() => {});
	});
});
