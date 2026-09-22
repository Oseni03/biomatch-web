export interface SentWhatsApp {
	to: string;
	template: string;
	params: string[];
	at: Date;
}

type WhatsAppProvider = "fake" | "meta";

const outbox: SentWhatsApp[] = [];
let fakeShouldFail = false;

export function getWhatsAppOutbox(): SentWhatsApp[] {
	return [...outbox];
}

export function clearWhatsAppOutbox(): void {
	outbox.length = 0;
}

export function setWhatsAppFakeFailure(fail: boolean): void {
	fakeShouldFail = fail;
}

function resolveProvider(): WhatsAppProvider {
	const configured = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
	if (configured === "meta" || configured === "fake") return configured;
	return process.env.NODE_ENV === "production" ? "meta" : "fake";
}

async function sendViaMeta(
	to: string,
	template: string,
	params: string[],
): Promise<{ id: string }> {
	const token = process.env.WHATSAPP_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
	if (!token || !phoneNumberId) {
		throw new Error("WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not set");
	}
	const response = await fetch(
		`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				messaging_product: "whatsapp",
				to: to.replace(/^\+/, ""),
				type: "template",
				template: {
					name: process.env.WHATSAPP_TEMPLATE_NAME?.trim() || template,
					language: { code: "en" },
					components: [
						{
							type: "body",
							parameters: params.map((text) => ({ type: "text", text })),
						},
					],
				},
			}),
		},
	);
	const payload = (await response.json().catch(() => null)) as {
		messages?: { id?: string }[];
		error?: { message?: string };
	} | null;
	if (!response.ok) {
		throw new Error(payload?.error?.message ?? `WhatsApp rejected the message (${response.status})`);
	}
	return { id: payload?.messages?.[0]?.id ?? "meta" };
}

export async function sendWhatsApp({
	to,
	template,
	params,
}: {
	to: string;
	template: string;
	params: string[];
}): Promise<{ id: string }> {
	if (resolveProvider() === "meta") {
		return sendViaMeta(to, template, params);
	}
	if (fakeShouldFail) {
		throw new Error("WhatsApp fake provider forced failure");
	}
	outbox.push({ to, template, params, at: new Date() });
	if (process.env.NODE_ENV !== "test") {
		console.log(`[whatsapp:fake] to ${to} template ${template}`);
	}
	return { id: `fake-${outbox.length}` };
}
