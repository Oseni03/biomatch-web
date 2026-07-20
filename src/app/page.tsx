import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Testimonial } from "@/components/landing/testimonial";
import { Partners } from "@/components/landing/partners";
import { FeatureRows } from "@/components/landing/feature-rows";
import { Impact } from "@/components/landing/impact";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
	return (
		<>
			<Navbar />
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
