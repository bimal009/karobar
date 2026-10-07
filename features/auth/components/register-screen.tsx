"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/toast"
import { signUp } from "@/lib/auth-client"
import { signUpSchema, type SignUpInput } from "@/lib/database/zod/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const input: SignUpInput = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    }
    const parsed = signUpSchema.safeParse(input)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check your details."
      setError(message)
      toast.add({ title: "Registration failed", description: message, type: "error" })
      return
    }

    setIsPending(true)
    const { error } = await signUp.email({
      ...parsed.data,
    })
    setIsPending(false)

    if (error) {
      const message = error.message ?? "Something went wrong. Please try again."
      setError(message)
      toast.add({ title: "Registration failed", description: message, type: "error" })
      return
    }

    router.push("/stores")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create your new Karobar workspace.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input id="name" name="name" required placeholder="Jane Doe" className="pr-9" disabled={isPending} />
            <User className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="pr-9"
              disabled={isPending}
            />
            <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="pr-9"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox required className="mt-0.5" disabled={isPending} />I agree to the{" "}
          <span className="text-primary">Terms &amp; Privacy</span>
        </label>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign In Instead
        </Link>
      </p>
    </div>
  )
}