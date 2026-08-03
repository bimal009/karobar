import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface FieldRowProps {
  label: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
}

export function FieldRow({ label, required, htmlFor, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  )
}
