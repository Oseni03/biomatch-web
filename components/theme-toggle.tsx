"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<button
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="p-2.5 rounded-2xl hover:bg-muted dark:hover:bg-zinc-800 transition-all duration-200"
			aria-label="Toggle theme"
		>
			{theme === "dark" ? (
				<Sun className="h-5 w-5 transition-transform hover:rotate-45" />
			) : (
				<Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
			)}
		</button>
	);
}
