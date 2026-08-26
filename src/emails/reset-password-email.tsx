import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Heading,
	Text,
	Button,
	Hr,
} from "@react-email/components";

interface ResetPasswordEmailProps {
	name: string;
	resetUrl: string;
}

export default function ResetPasswordEmail({
	name,
	resetUrl,
}: ResetPasswordEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Reset your BioMatch password</Preview>
			<Body
				style={{
					fontFamily: "Arial, sans-serif",
					padding: "40px 20px",
				}}
			>
				<Container
					style={{
						maxWidth: 600,
						margin: "0 auto",
						border: "1px solid #e5e7eb",
						borderRadius: 12,
						padding: 32,
					}}
				>
					<Heading
						style={{
							fontSize: 24,
							fontWeight: 700,
							color: "#111827",
							marginBottom: 8,
						}}
					>
						Reset your password
					</Heading>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 16,
						}}
					>
						Hi {name},
					</Text>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 24,
						}}
					>
						We received a request to reset your BioMatch password. Use the
						button below to choose a new one.
					</Text>

					<Section
						style={{
							backgroundColor: "#f3f4f6",
							borderRadius: 8,
							padding: 16,
							marginBottom: 24,
						}}
					>
						<Text style={{ margin: 0, color: "#374151" }}>
							If you did not request this reset, you can safely ignore this
							email.
						</Text>
					</Section>

					<Button
						href={resetUrl}
						style={{
							display: "inline-block",
							padding: "12px 32px",
							backgroundColor: "#C1121F",
							color: "#ffffff",
							textDecoration: "none",
							borderRadius: 8,
							fontWeight: 600,
							fontSize: 16,
						}}
					>
						Reset password
					</Button>

					<Hr style={{ marginTop: 32, borderColor: "#e5e7eb" }} />

					<Text
						style={{
							fontSize: 12,
							color: "#9ca3af",
							textAlign: "center",
						}}
					>
						BioMatch — Saving lives, one donation at a time.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
