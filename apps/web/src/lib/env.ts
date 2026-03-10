import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
})

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment variables")
}

export const env = parsed.data
