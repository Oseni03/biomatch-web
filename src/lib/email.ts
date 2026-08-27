import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = process.env.EMAIL_FROM ?? "noreply@biomatchlimited.org";

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

	const { data, error } = await resend.emails.send({
		from: FROM,
		to,
		subject,
		react,
	});

	if (error) {
		console.error("Failed to send email to", to, error.message);
		return { id: "failed" };
	}

	return { id: data.id };
}
