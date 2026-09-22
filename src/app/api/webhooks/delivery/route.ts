import { NextResponse } from "next/server";
import { z } from "zod";
import { handleDeliveryCallback } from "@/servers/delivery";

const callbackSchema = z.object({
	providerMessageId: z.string().min(1).max(200),
	status: z.enum(["delivered", "failed"]),
	provider: z.string().max(60).optional(),
	error: z.string().max(500).optional(),
});

export async function POST(request: Request) {
	const secret = process.env.DELIVERY_WEBHOOK_SECRET;
	const authorization = request.headers.get("authorization");
	if (!secret || authorization !== `Bearer ${secret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const parsed = callbackSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}
	const result = await handleDeliveryCallback(parsed.data);
	return NextResponse.json(result);
}
