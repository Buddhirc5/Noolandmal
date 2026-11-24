import { z } from "zod";

export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook"] as const;
export const FOLLOWER_RANGES = ["1,000 – 5,000", "5,000 – 20,000", "20,000 – 100,000", "100,000+"] as const;
export const CREATOR_STATUSES = ["new", "approved", "declined", "posted"] as const;
export type CreatorStatus = (typeof CREATOR_STATUSES)[number];

export const creatorSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  phone: z
    .string()
    .trim()
    .min(9, "Enter your WhatsApp number")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Phone number can only contain digits"),
  email: z.string().trim().max(120).email("Enter a valid email").or(z.literal("")).optional(),
  platform: z.enum(PLATFORMS, { message: "Choose your main platform" }),
  followers: z.enum(FOLLOWER_RANGES, { message: "Choose your follower range" }),
  handle: z.string().trim().min(2, "Add your handle or profile link").max(200),
  design: z.string().trim().max(80).optional(),
  videoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\/[^\s]+\.[^\s]+/i.test(v), "Paste a full link starting with https://")
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});
export type CreatorInput = z.infer<typeof creatorSchema>;

export interface CreatorApplication {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  platform: string;
  followers: string;
  handle: string;
  design: string | null;
  video_url: string | null;
  notes: string;
  status: CreatorStatus;
  created_at: string;
}
