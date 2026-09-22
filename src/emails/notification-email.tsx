import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Heading,
	Text,
} from "@react-email/components";

interface NotificationEmailProps {
	title: string;
	body: string;
}

export default function NotificationEmail({ title, body }: NotificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>{title}</Preview>
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
					<Heading style={{ fontSize: 22, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
						{title}
					</Heading>
					<Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>
						{body}
					</Text>
					<Text style={{ fontSize: 14, color: "#6b7280" }}>
						Open your BioMatch app to respond.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
