export interface SentSms {
	to: string;
	message: string;
	at: Date;
}

type SmsProvider = "fake" | "termii";

const outbox: SentSms[] = [];

export function getSmsOutbox(): SentSms[] {
	return [...outbox];
}

export function clearSmsOutbox(): void {
	outbox.length = 0;
}

function resolveProvider(): SmsProvider {
	const configured = process.env.SMS_PROVIDER?.trim().toLowerCase();
	if (configured === "termii" || configured === "fake") return configured;
	return process.env.NODE_ENV === "production" ? "termii" : "fake";
}

async function sendViaTermii(to: string, message: string): Promise<{ id: string }> {
	const apiKey = process.env.TERMII_API_KEY;
	if (!apiKey) {
		throw new Error("TERMII_API_KEY is not set");
	}
	const response = await fetch("https://api.ng.termii.com/api/sms/send", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			to: to.replace(/^\+/, ""),
			from: process.env.TERMII_SENDER_ID?.trim() || "BioMatch",
			sms: message,
			type: "plain",
			channel: process.env.TERMII_CHANNEL?.trim() || "generic",
			api_key: apiKey,
		}),
	});
	const payload = (await response.json().catch(() => null)) as {
		message_id?: string;
		message?: string;
	} | null;
	if (!response.ok) {
		throw new Error(payload?.message ?? `Termii rejected the SMS (${response.status})`);
	}
	return { id: payload?.message_id ?? "termii" };
}

export async function sendSms({
	to,
	message,
}: {
	to: string;
	message: string;
}): Promise<{ id: string }> {
	if (resolveProvider() === "termii") {
		return sendViaTermii(to, message);
	}
	outbox.push({ to, message, at: new Date() });
	if (process.env.NODE_ENV !== "test") {
		console.log(`[sms:fake] to ${to}: ${message}`);
	}
	return { id: "fake" };
}
