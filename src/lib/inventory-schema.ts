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
