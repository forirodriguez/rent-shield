import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Centralizamos el contenedor para mantener la UI consistente entre pantallas.
export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("w-full gap-0", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-base">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="border-t pt-6">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
