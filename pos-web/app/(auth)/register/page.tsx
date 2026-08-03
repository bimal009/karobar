"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Store, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/acme-retail/dashboard")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create your new Karobar workspace.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="store">
            Store name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input id="store" required placeholder="Acme Retail" className="pr-9" />
            <Store className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input id="name" required placeholder="Jane Doe" className="pr-9" />
            <User className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input id="email" type="email" required placeholder="you@company.com" className="pr-9" />
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
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox required className="mt-0.5" />I agree to the <span className="text-primary">Terms &amp; Privacy</span>
        </label>
        <Button type="submit" className="w-full">
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
