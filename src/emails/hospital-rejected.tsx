import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Heading,
	Text,
	Hr,
} from "@react-email/components";

interface HospitalRejectedEmailProps {
	hospitalName: string;
	reason: string;
}

export default function HospitalRejectedEmail({
	hospitalName,
	reason,
}: HospitalRejectedEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Update on your BioMatch hospital application</Preview>
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
						Application Update
					</Heading>

					<Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>
						Thank you for applying to join BioMatch as <strong>{hospitalName}</strong>.
						After review we could not approve this application yet.
					</Text>

					<Section
						style={{ backgroundColor: "#f3f4f6", borderRadius: 8, padding: 16, marginBottom: 24 }}
					>
						<Text style={{ margin: 0, color: "#374151" }}>
							<strong>Reason:</strong> {reason}
						</Text>
					</Section>

					<Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>
						You can correct the issue above and reapply from your hospital
						portal. Your account stays active while you wait.
					</Text>

					<Hr style={{ marginTop: 32, borderColor: "#e5e7eb" }} />

					<Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
						BioMatch — Saving lives, one donation at a time.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
