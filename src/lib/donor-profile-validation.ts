import { z } from "zod";

export const BLOOD_GROUP_ENUMS = [
	"A_POS",
	"A_NEG",
	"B_POS",
	"B_NEG",
	"AB_POS",
	"AB_NEG",
	"O_POS",
	"O_NEG",
] as const;

export const BLOOD_GROUP_LABELS = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
] as const;

export type BloodGroupLabel = (typeof BLOOD_GROUP_LABELS)[number];

export const BLOOD_GROUP_LABEL_TO_ENUM: Record<BloodGroupLabel, string> = {
	"A+": "A_POS",
	"A-": "A_NEG",
	"B+": "B_POS",
	"B-": "B_NEG",
	"AB+": "AB_POS",
	"AB-": "AB_NEG",
	"O+": "O_POS",
	"O-": "O_NEG",
};

const latitudeSchema = z
	.number({ error: "Latitude must be a number" })
	.min(-90, { error: "Latitude must be between -90 and 90" })
	.max(90, { error: "Latitude must be between -90 and 90" })
	.refine((v) => Number.isFinite(v), { error: "Latitude must be a finite number" });

const longitudeSchema = z
	.number({ error: "Longitude must be a number" })
	.min(-180, { error: "Longitude must be between -180 and 180" })
	.max(180, { error: "Longitude must be between -180 and 180" })
	.refine((v) => Number.isFinite(v), {
		error: "Longitude must be a finite number",
	});

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.optional()
		.transform((v) => (v === "" ? undefined : v));

export const donorProfileInputSchema = z
	.object({
		bloodGroup: z.enum(BLOOD_GROUP_ENUMS, {
			error: "Please select your blood group",
		}),
		dateOfBirth: z
			.string()
			.trim()
			.optional()
			.transform((v) => (v === "" ? undefined : v))
			.refine(
				(v) => v === undefined || !Number.isNaN(Date.parse(v)),
				{ error: "Enter a valid date of birth" },
			)
			.refine(
				(v) => {
					if (v === undefined) return true;
					const d = new Date(v);
					const now = new Date();
					if (d.getTime() > now.getTime()) return false;
					const oldest = new Date();
					oldest.setFullYear(oldest.getFullYear() - 120);
					return d.getTime() >= oldest.getTime();
				},
				{ error: "Date of birth must be a past date within the last 120 years" },
			),
		homeAddress: optionalText(255),
		state: optionalText(100),
		lga: optionalText(100),
		homeLatitude: z.number().optional(),
		homeLongitude: z.number().optional(),
		isAvailable: z.boolean(),
	})
	.superRefine((data, ctx) => {
		const latProvided = data.homeLatitude !== undefined;
		const lngProvided = data.homeLongitude !== undefined;
		if (latProvided !== lngProvided) {
			ctx.addIssue({
				code: "custom",
				path: latProvided ? ["homeLongitude"] : ["homeLatitude"],
				message: "Provide both latitude and longitude for your home pin",
			});
			return;
		}
		if (latProvided && lngProvided) {
			const lat = latitudeSchema.safeParse(data.homeLatitude);
			if (!lat.success) {
				for (const issue of lat.error.issues) {
					ctx.addIssue({ ...issue, path: ["homeLatitude"] });
				}
			}
			const lng = longitudeSchema.safeParse(data.homeLongitude);
			if (!lng.success) {
				for (const issue of lng.error.issues) {
					ctx.addIssue({ ...issue, path: ["homeLongitude"] });
				}
			}
		}
	});

export type DonorProfileInput = z.infer<typeof donorProfileInputSchema>;

export const lastKnownLocationSchema = z.object({
	latitude: latitudeSchema,
	longitude: longitudeSchema,
});

export type LastKnownLocationInput = z.infer<typeof lastKnownLocationSchema>;
