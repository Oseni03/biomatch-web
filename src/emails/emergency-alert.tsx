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

interface EmergencyAlertEmailProps {
	donorName: string;
	hospitalName: string;
	hospitalLocation: string;
	bloodGroup: string;
	urgencyLevel: string;
	distance: string;
	acceptUrl: string;
}

function formatBloodGroup(bg: string): string {
	return bg.replace(/_/g, "").replace("PLUS", "+").replace("MINUS", "-");
}

export default function EmergencyAlertEmail({
	donorName,
	hospitalName,
	hospitalLocation,
	bloodGroup,
	urgencyLevel,
	distance,
	acceptUrl,
}: EmergencyAlertEmailProps) {
	const isCritical = urgencyLevel === "critical";

	return (
		<Html>
			<Head />
			<Preview>
				{isCritical ? "CRITICAL" : "Urgent"} — {hospitalName} needs{" "}
				{formatBloodGroup(bloodGroup)} blood
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
							color: isCritical ? "#dc2626" : "#1f2937",
							marginBottom: 8,
						}}
					>
						{isCritical
							? "CRITICAL — Blood Donation Needed"
							: "Urgent Blood Donation Needed"}
					</Heading>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 24,
						}}
					>
						Hi {donorName},
					</Text>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 16,
						}}
					>
						<strong>{hospitalName}</strong> has issued an emergency
						request for blood donations. Your blood type (
						{formatBloodGroup(bloodGroup)}) is compatible and you
						are within range.
					</Text>

					<Section
						style={{
							backgroundColor: "#f3f4f6",
							borderRadius: 8,
							padding: 16,
							marginBottom: 24,
						}}
					>
						<Text style={{ margin: "4px 0", color: "#374151" }}>
							<strong>Hospital:</strong> {hospitalName}
						</Text>
						<Text style={{ margin: "4px 0", color: "#374151" }}>
							<strong>Location:</strong> {hospitalLocation}
						</Text>
						<Text style={{ margin: "4px 0", color: "#374151" }}>
							<strong>Blood Type Needed:</strong>{" "}
							{formatBloodGroup(bloodGroup)}
						</Text>
						<Text style={{ margin: "4px 0", color: "#374151" }}>
							<strong>Distance:</strong> {distance}
						</Text>
						<Text style={{ margin: "4px 0", color: "#374151" }}>
							<strong>Urgency:</strong>{" "}
							{isCritical
								? "Critical — respond immediately"
								: "Standard"}
						</Text>
					</Section>

					<Button
						href={acceptUrl}
						style={{
							display: "inline-block",
							padding: "12px 32px",
							backgroundColor: isCritical ? "#dc2626" : "#2563eb",
							color: "#ffffff",
							textDecoration: "none",
							borderRadius: 8,
							fontWeight: 600,
							fontSize: 16,
						}}
					>
						Accept & Depart
					</Button>

					<Text
						style={{
							fontSize: 14,
							color: "#9ca3af",
							marginTop: 24,
							marginBottom: 0,
						}}
					>
						You will earn 100 points for each completed donation.
					</Text>

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
