export const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.06 },
	},
};

export const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35 },
	},
};

export const compactContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.05 },
	},
};

export const compactCardVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35 },
	},
};

// Shared "smooth" curve for the marketing site — a soft easeOutExpo, closer to
// the reference site's feel than the default easeOut.
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: EASE_SMOOTH },
	},
};

export const fadeUpStagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12, delayChildren: 0.05 },
	},
};

export const scaleIn = {
	hidden: { opacity: 0, scale: 0.94 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.6, ease: EASE_SMOOTH },
	},
};
