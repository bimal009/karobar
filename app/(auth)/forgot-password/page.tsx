"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false)

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ve sent password reset instructions to your email address.
          </p>
        </div>
        <Button render={<Link href="/login" />} className="w-full">
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          If you forgot your password, well, then we&apos;ll email you instructions to reset it.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input id="email" type="email" required placeholder="you@company.com" className="pr-9" />
            <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Return to{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
