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

interface VerificationEmailProps {
	name: string;
	verifyUrl: string;
}

export default function VerificationEmail({
	name,
	verifyUrl,
}: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your BioMatch email</Preview>
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
						Verify your email
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
						Thanks for joining BioMatch. Please verify your email address to
						keep your account active and start receiving donor and hospital
						alerts.
					</Text>

					<Button
						href={verifyUrl}
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
						Verify my email
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
