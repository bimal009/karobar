import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/page-header"

export default function SuperAdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Platform Settings" crumbs={[{ label: "Dashboard", href: "/superadmin" }, { label: "Settings" }]} />

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h3 className="font-semibold">General</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="platform-name">Platform name</Label>
              <Input id="platform-name" defaultValue="Karobar" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="support-email">Support email</Label>
              <Input id="support-email" defaultValue="support@karobar.com" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="default-domain">Default workspace domain</Label>
            <Input id="default-domain" defaultValue="karobar.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h3 className="font-semibold">Tenant defaults</h3>
          {[
            { label: "Allow self-service sign up", description: "New tenants can register without an invite." },
            { label: "14-day free trial", description: "Automatically start new tenants on a trial period." },
            { label: "Require email verification", description: "New staff accounts must verify their email." },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={i !== 2} />
              </div>
              {i < 2 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <h3 className="font-semibold">Danger zone</h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Maintenance mode</p>
              <p className="text-sm text-muted-foreground">Temporarily block tenant access during upgrades.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
