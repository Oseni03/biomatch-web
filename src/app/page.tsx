import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { getServerSession } from "@/lib/get-session";
import { BloodShortage } from "@/components/landing/blood-shortage";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ForDonors } from "@/components/landing/for-donors";
import { ForHospitals } from "@/components/landing/for-hospitals";
import { Safety } from "@/components/landing/safety";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
	const session = await getServerSession();
	return (
		<div className="min-h-screen bg-[#06070a] text-[#f8f9fc] flex flex-col selection:bg-red-600 selection:text-white">
			<Navbar serverSession={session} />
			<main className="flex-1">
				{/* 1. Hero: Minimal, single visual, clear CTAs */}
				<Hero />

				{/* 2. BloodShortage: "Why does this matter?" */}
				<BloodShortage />

				{/* 3. HowItWorks: "How does BioMATCH work?" */}
				<HowItWorks />

				{/* 4. ForDonors: "How can I help?" */}
				<ForDonors />

				{/* 5. ForHospitals: "Why would my hospital use this?" */}
				<ForHospitals />

				{/* 6. Safety: "Can I trust it?" */}
				<Safety />

				{/* 7. Pricing: "What does it cost?" */}
				<Pricing />

				{/* 8. FinalCTA: "What should I do next?" */}
				<FinalCTA />
			</main>
			<Footer />
		</div>
	);
}
