import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const GUIDELINES = [
  {
    title: "Sandbox",
    message:
      "Los usuarios pueden elegir su rol para validar flujos rápidamente.",
  },
  {
    title: "Producción",
    message:
      "Los roles se asignan desde el panel administrativo para proteger el acceso.",
  },
] as const

export function RoleGuidelinesCard() {
  return (
    <Card className="w-full border-amber-200 bg-amber-50/70 text-amber-950 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>⚠️</span> Roles y permisos
        </CardTitle>
        <CardDescription>
          Define el rol sólo para entornos de prueba. En productivo será
          establecido por un administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {GUIDELINES.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-amber-200 bg-white/70 px-3 py-2"
          >
            <Badge variant="outline" className="border-amber-200 text-amber-900">
              {item.title}
            </Badge>
            <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
