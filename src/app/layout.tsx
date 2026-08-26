import type { Metadata } from "next";
import "./globals.css";
import { Geist_Mono, Hanken_Grotesk, Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const hankenGrotesk = Hanken_Grotesk({
	variable: "--font-sans",
	subsets: ["latin"],
});

const newsreader = Newsreader({
	variable: "--font-serif",
	subsets: ["latin"],
	style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "BioMatch — Blood Management System",
	description:
		"Incentivized blood donation and hospital inventory marketplace.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={cn(
				"dark font-sans",
				hankenGrotesk.variable,
				newsreader.variable,
				geistMono.variable,
			)}
		>
			<body className="antialiased text-foreground">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
