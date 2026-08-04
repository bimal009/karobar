import { z } from "zod/v4"

export const memberInsertSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  roleId: z.string().min(1, "Role is required"),
  branchIds: z.array(z.string()),
})

export const memberUpdateSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
  branchIds: z.array(z.string()),
})

export type MemberInsert = z.infer<typeof memberInsertSchema>
export type MemberUpdate = z.infer<typeof memberUpdateSchema>
