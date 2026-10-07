import { z } from "zod/v4"

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.email("Please enter a valid email address.").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
