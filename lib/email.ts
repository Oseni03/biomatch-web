import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = process.env.EMAIL_FROM ?? "noreply@biomatch.com";

export async function sendEmail({
	to,
	subject,
	react,
}: {
	to: string;
	subject: string;
	react: React.ReactElement;
}) {
	if (!process.env.RESEND_API_KEY) {
		console.warn("RESEND_API_KEY not set -- skipping email to", to);
		return { id: "mock" };
	}

	const response = await resend.emails.send({
		from: FROM,
		to,
		subject,
		react,
	});

	if (response.error) {
		throw new Error(response.error.message);
	}

	return { id: response.data.id };
}
