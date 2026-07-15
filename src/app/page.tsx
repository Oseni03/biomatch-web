import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Services } from "@/components/landing/services";
import { Impact } from "@/components/landing/impact";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
	return (
		<>
			<Navbar />
			<Hero />
			<Stats />
			<HowItWorks />
			<Testimonials />
			<Services />
			<Impact />
			<Footer />
		</>
	);
}
