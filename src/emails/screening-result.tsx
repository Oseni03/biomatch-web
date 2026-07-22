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

interface ScreeningResultEmailProps {
	donorName: string;
	status: "passed" | "failed";
	notes?: string | null;
}

export default function ScreeningResultEmail({
	donorName,
	status,
	notes,
}: ScreeningResultEmailProps) {
	const passed = status === "passed";

	return (
		<Html>
			<Head />
			<Preview>
				{passed
					? "You're cleared to donate"
					: "Update on your recent screening"}
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
							color: passed ? "#16a34a" : "#dc2626",
							marginBottom: 8,
						}}
					>
						{passed
							? "You're Cleared to Donate"
							: "Screening Result: Not Cleared"}
					</Heading>

					<Text
						style={{
							fontSize: 16,
							color: "#4b5563",
							marginBottom: 16,
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
						{passed
							? "Your recent blood screening has been reviewed and you're now verified to receive emergency donation requests."
							: "Your recent blood screening result means you're not currently eligible to donate. You can visit a partner hospital again for a follow-up screening at any time."}
					</Text>

					{notes && (
						<Section
							style={{
								backgroundColor: "#f3f4f6",
								borderRadius: 8,
								padding: 16,
								marginBottom: 24,
							}}
						>
							<Text style={{ margin: 0, color: "#374151" }}>
								<strong>Note from hospital staff:</strong>{" "}
								{notes}
							</Text>
						</Section>
					)}

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
