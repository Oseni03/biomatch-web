import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Mission } from "@/components/landing/mission";
import { Services } from "@/components/landing/services";
import { Impact } from "@/components/landing/impact";
import { Join } from "@/components/landing/join";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
	return (
		<>
			<Navbar />
			<Hero />
			<Stats />
			<Mission />
			<Services />
			<Impact />
			<Join />
			<Footer />
		</>
	);
}
