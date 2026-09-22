import { NextResponse } from "next/server";
import { sweepExpiredVouchers } from "@/servers/vouchers";

export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET;
	const authorization = request.headers.get("authorization");
	if (!secret || authorization !== `Bearer ${secret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const result = await sweepExpiredVouchers();
	return NextResponse.json(result);
}
