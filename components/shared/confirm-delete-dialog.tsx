"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConfirmDeleteDialogProps {
  trigger: React.ReactElement
  title: string
  description?: string
  /** Return `false` to keep the dialog open (e.g. the delete failed). */
  onConfirm: () => boolean | void | Promise<boolean | void>
  isPending?: boolean
}

export function ConfirmDeleteDialog({
  trigger,
  title,
  description = "This action cannot be undone.",
  onConfirm,
  isPending,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = React.useState(false)

  async function handleConfirm() {
    const result = await onConfirm()
    if (result !== false) setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
