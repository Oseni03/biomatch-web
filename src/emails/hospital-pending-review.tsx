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

interface HospitalPendingReviewEmailProps {
	hospitalName: string;
	registrationNumber?: string | null;
	officialEmail: string;
	address: string;
	state: string;
	submittedAt: string;
	reviewUrl?: string;
}

export default function HospitalPendingReviewEmail({
	hospitalName,
	registrationNumber,
	officialEmail,
	address,
	state,
	submittedAt,
	reviewUrl = "https://biomatchlimited.org/admin/hospitals",
}: HospitalPendingReviewEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>New hospital awaiting verification: {hospitalName}</Preview>
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
						New Hospital Pending Verification
					</Heading>

					<Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>
						<strong>{hospitalName}</strong> just registered and is waiting
						for verification before emergency dispatch is enabled.
					</Text>

					<Section
						style={{ backgroundColor: "#f3f4f6", borderRadius: 8, padding: 16, marginBottom: 24 }}
					>
						<Text style={{ margin: "0 0 8px", color: "#374151" }}>
							<strong>Registration no:</strong> {registrationNumber || "—"}
						</Text>
						<Text style={{ margin: "0 0 8px", color: "#374151" }}>
							<strong>Official email:</strong> {officialEmail}
						</Text>
						<Text style={{ margin: "0 0 8px", color: "#374151" }}>
							<strong>Address:</strong> {address}, {state}
						</Text>
						<Text style={{ margin: 0, color: "#374151" }}>
							<strong>Submitted:</strong> {submittedAt}
						</Text>
					</Section>

					<Button
						href={reviewUrl}
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
						Review Application
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
