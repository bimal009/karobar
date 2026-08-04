"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/page-header"
import type { StoreSettings } from "../api/settings.action"

interface SettingsViewProps {
  tenant: string
  data: StoreSettings
}

export function SettingsView({ tenant, data }: SettingsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Settings" }]} />

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h3 className="font-semibold">Store Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input id="store-name" defaultValue={data.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-slug">Workspace URL</Label>
              <Input id="store-slug" defaultValue={`karobar.com/${data.slug}`} readOnly />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner-name">Owner name</Label>
              <Input id="owner-name" defaultValue={data.ownerName} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner-email">Owner email</Label>
              <Input id="owner-email" defaultValue={data.ownerEmail} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h3 className="font-semibold">Preferences</h3>
          {[
            { label: "Low stock alerts", description: "Notify staff when a product falls below its threshold." },
            { label: "Email receipts", description: "Automatically email a receipt after every sale." },
            { label: "Allow negative stock", description: "Permit sales even when stock quantity reaches zero." },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={i < 2} />
              </div>
              {i < 2 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
