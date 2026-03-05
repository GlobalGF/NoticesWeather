import { z } from "zod";

const slugSchema = z.string().min(2).max(120).regex(/^[a-z0-9-]+$/);

export function parseSlug(value: string): string {
  return slugSchema.parse(value);
}

export function tryParseSlug(value: string): string | null {
  const parsed = slugSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}