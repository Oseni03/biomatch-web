import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geistSans = Geist({
	variable: "--font-sans",
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
			className={cn("font-sans", geistSans.variable, geistMono.variable)}
			suppressHydrationWarning
		>
			<body className="antialiased text-foreground">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
