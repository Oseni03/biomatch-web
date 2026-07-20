"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

const SafeThemeProvider = NextThemesProvider as any;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<SafeThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			storageKey="biomatch-theme"
		>
			{children}
		</SafeThemeProvider>
	);
}
