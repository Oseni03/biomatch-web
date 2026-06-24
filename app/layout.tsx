import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
			className={cn("font-sans", inter.variable)}
			suppressHydrationWarning
		>
			<body className="antialiased text-gray-900 dark:text-gray-100">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
