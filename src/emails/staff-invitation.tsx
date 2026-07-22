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

interface StaffInvitationEmailProps {
	organizationName: string;
	inviterName: string;
	role: string;
	acceptUrl: string;
}

export default function StaffInvitationEmail({
	organizationName,
	inviterName,
	role,
	acceptUrl,
}: StaffInvitationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				{inviterName} invited you to join {organizationName} on BioMatch
			</Preview>
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
							color: "#1f2937",
							marginBottom: 8,
						}}
					>
						You've Been Invited
					</Heading>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 16,
						}}
					>
						<strong>{inviterName}</strong> has invited you to join{" "}
						<strong>{organizationName}</strong> on BioMatch as a{" "}
						<strong>{role}</strong>.
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
							Accept this invitation to help manage blood
							inventory and respond to emergency requests for{" "}
							{organizationName}.
						</Text>
					</Section>

					<Button
						href={acceptUrl}
						style={{
							display: "inline-block",
							padding: "12px 32px",
							backgroundColor: "#2563eb",
							color: "#ffffff",
							textDecoration: "none",
							borderRadius: 8,
							fontWeight: 600,
							fontSize: 16,
						}}
					>
						Accept Invitation
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
