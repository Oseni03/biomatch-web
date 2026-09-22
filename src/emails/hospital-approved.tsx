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

interface HospitalApprovedEmailProps {
	hospitalName: string;
	portalUrl?: string;
}

export default function HospitalApprovedEmail({
	hospitalName,
	portalUrl = "https://biomatchlimited.org/hospital",
}: HospitalApprovedEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your hospital application was approved — welcome to BioMatch</Preview>
			<Body style={{ fontFamily: "Arial, sans-serif", padding: "40px 20px" }}>
				<Container
					style={{
						maxWidth: 600,
						margin: "0 auto",
						border: "1px solid #e5e7eb",
						borderRadius: 12,
						padding: 32,
					}}
				>
					<Heading style={{ fontSize: 24, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
						Application Approved
					</Heading>

					<Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>
						Congratulations — <strong>{hospitalName}</strong> is now a verified
						BioMatch hospital. Your team can sign in, create emergency blood
						requests and reach eligible donors right away.
					</Text>

					<Section
						style={{ backgroundColor: "#f3f4f6", borderRadius: 8, padding: 16, marginBottom: 24 }}
					>
						<Text style={{ margin: 0, color: "#374151" }}>
							Next step: invite your team members from the hospital portal so
							doctors and desk staff can manage requests under their own logins.
						</Text>
					</Section>

					<Button
						href={portalUrl}
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
						Open Hospital Portal
					</Button>

					<Hr style={{ marginTop: 32, borderColor: "#e5e7eb" }} />

					<Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
						BioMatch — Saving lives, one donation at a time.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
