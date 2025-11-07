import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const PASSWORD_HINT = "password123"

const DEMO_CREDENTIALS = [
  { role: "Super Admin", email: "superadmin@test.com" },
  { role: "Owner", email: "owner@test.com" },
  { role: "Manager", email: "manager@test.com" },
  { role: "Tenant", email: "tenant@test.com" },
] as const

export function DemoCredentialsCard() {
  return (
    <Card className="w-full border-dashed border-primary/40 bg-primary/5 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>🔐</span> Credenciales de prueba
        </CardTitle>
        <CardDescription>
          Usa estos accesos para revisar cada rol durante las demos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/40 bg-background px-4 py-3">
          <p className="text-sm text-muted-foreground">Password</p>
          <p className="font-mono text-base font-semibold tracking-tight">
            {PASSWORD_HINT}
          </p>
        </div>
        <div className="h-px w-full bg-border/80" aria-hidden />
        <ul className="space-y-3">
          {DEMO_CREDENTIALS.map((credential) => (
            <li
              key={credential.role}
              className="rounded-lg border border-border/80 bg-background px-4 py-3"
            >
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold">{credential.role}</p>
                <Badge variant="outline" className="font-mono">
                  {credential.email}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
