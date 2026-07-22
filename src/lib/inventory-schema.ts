import { z } from "zod";

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const bloodGroupSchema = z.enum(BLOOD_GROUPS);

export const inventorySchema = z.object({
  "A+": z.number().int().nonnegative(),
  "A-": z.number().int().nonnegative(),
  "B+": z.number().int().nonnegative(),
  "B-": z.number().int().nonnegative(),
  "AB+": z.number().int().nonnegative(),
  "AB-": z.number().int().nonnegative(),
  "O+": z.number().int().nonnegative(),
  "O-": z.number().int().nonnegative(),
});

export type Inventory = z.infer<typeof inventorySchema>;

const BLOOD_GROUP_ENUM_MAP = {
  "A+": "A_PLUS",
  "A-": "A_MINUS",
  "B+": "B_PLUS",
  "B-": "B_MINUS",
  "AB+": "AB_PLUS",
  "AB-": "AB_MINUS",
  "O+": "O_PLUS",
  "O-": "O_MINUS",
} as const;

// "A+" -> "A_PLUS", "AB-" -> "AB_MINUS" — matches the BloodGroup DB enum.
export function toBloodGroupEnum(display: (typeof BLOOD_GROUPS)[number]) {
  return BLOOD_GROUP_ENUM_MAP[display];
}
