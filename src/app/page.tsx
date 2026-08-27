import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Testimonial } from "@/components/landing/testimonial";
import { Partners } from "@/components/landing/partners";
import { FeatureRows } from "@/components/landing/feature-rows";
import { Impact } from "@/components/landing/impact";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";
import { getServerSession } from "@/lib/get-session";

export default async function HomePage() {
	const session = await getServerSession();
	return (
		<>
			<Navbar serverSession={session} />
			<Hero />
			<Testimonial />
			<Partners />
			<FeatureRows />
			<Impact />
			<CtaBand />
			<Footer />
		</>
	);
}
