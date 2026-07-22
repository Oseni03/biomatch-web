import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
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
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				brand: {
					DEFAULT: "hsl(var(--red))",
					deep: "hsl(var(--red-deep))",
					ink: "hsl(var(--red-ink))",
					hover: "hsl(var(--red-deep))",
					light: "hsl(var(--red-bg))",
					muted: "hsl(var(--red) / 0.6)",
				},
				cream: "hsl(var(--cream))",
				paper: "hsl(var(--paper))",
				ink: "hsl(var(--ink))",
				slate: "hsl(var(--slate))",
				emergency: "hsl(var(--emergency))",
				status: {
					critical: "hsl(var(--status-critical))",
					"critical-bg": "hsl(var(--status-critical-bg))",
					low: "hsl(var(--status-low))",
					"low-bg": "hsl(var(--status-low-bg))",
					ok: "hsl(var(--status-ok))",
					"ok-bg": "hsl(var(--status-ok-bg))",
					info: "hsl(var(--status-info))",
					"info-bg": "hsl(var(--status-info-bg))",
				},
			},
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
				serif: ["var(--font-serif)", "Georgia", "serif"],
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
				card: "16px",
			},
			boxShadow: {
				"card": "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -6px rgba(0,0,0,0.5)",
				"card-hover": "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 16px 40px -8px rgba(0,0,0,0.65)",
				"brand": "0 4px 24px rgba(244,26,68,0.35), 0 0 0 1px rgba(244,26,68,0.12)",
				"glow": "0 0 40px rgba(244,26,68,0.28)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
