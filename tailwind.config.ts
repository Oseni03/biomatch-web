import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./hooks/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			keyframes: {
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"fade-in-up": {
					from: { opacity: "0", transform: "translateY(30px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				"fade-in": "fade-in 0.8s ease-out forwards",
				"fade-in-up": "fade-in-up 0.8s ease-out forwards",
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				brand: {
					DEFAULT: "#C1121F",
					hover: "#9C0E19",
					light: "#FDF2F3",
					muted: "#F97171",
				},
				dark: {
					bg: "#0F0F0E",
					surface: "#1C1C1A",
					border: "#2A2A28",
				},
			},
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "monospace"],
			},
			fontSize: {
				"display-xl": ["3.25rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
				"display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
				"stat": ["2.75rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
			},
			borderRadius: {
				"2xl": "14px",
				"3xl": "20px",
				"4xl": "28px",
			},
			boxShadow: {
				"card": "0 2px 8px rgba(0,0,0,0.07)",
				"card-hover": "0 8px 32px rgba(0,0,0,0.12)",
				"brand": "0 4px 20px rgba(193,18,31,0.25)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
