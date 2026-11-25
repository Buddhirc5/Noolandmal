import { z } from "zod";
import { phoneField } from "./phone";

export const BUDGETS = ["Under LKR 10,000", "LKR 10,000 – 25,000", "LKR 25,000 – 45,000", "LKR 45,000 – 75,000", "Over LKR 75,000"] as const;
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
/** Vercel functions accept ~4.5 MB request bodies; photos are compressed in the browser first. */
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
  .or(z.literal(""))
  .optional();

export const customRequestSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  phone: phoneField(),
  occasion: z.string().trim().min(1, "Choose an occasion").max(40),
  neededBy: optionalDate,
  budget: z.string().max(40).optional(),
  referenceUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\/[^\s]+\.[^\s]+/i.test(v), "Paste a full link starting with https://")
    .optional(),
  notes: z.string().trim().max(1500).optional(),
  sizeNotes: z.string().trim().max(300).optional(),
});
export type CustomRequestInput = z.infer<typeof customRequestSchema>;
