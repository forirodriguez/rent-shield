"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";

const PASSWORD = "demo1234";

const DEMO_CREDENTIALS = [
  { role: "Super Admin", email: "superadmin@test.com", variant: "default" as const },
  { role: "Owner", email: "owner@test.com", variant: "secondary" as const },
  { role: "Manager", email: "manager@test.com", variant: "outline" as const },
  { role: "Tenant", email: "tenant@test.com", variant: "outline" as const },
] as const;

type DemoCredentialsCardProps = {
  callbackUrl?: string;
};

export function DemoCredentialsCard({ callbackUrl = "/dashboard" }: DemoCredentialsCardProps) {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (email: string) => {
    setError(null);
    setLoadingEmail(email);

    try {
      const result = await signIn("credentials", {
        email,
        password: PASSWORD,
        redirect: false,
      });

      if (result?.error) {
        setError(`Error al iniciar sesión como ${email}`);
        setLoadingEmail(null);
        return;
      }

      // Successful login
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("Error inesperado al iniciar sesión");
      setLoadingEmail(null);
      console.error("Quick login error:", err);
    }
  };

  const isLoading = loadingEmail !== null;

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Card className="w-full border-dashed border-primary/40 bg-primary/5 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>🚀</span> Quick Login (Dev)
        </CardTitle>
        <CardDescription>
          Haz clic en cualquier usuario para iniciar sesión automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/40 bg-background px-4 py-3">
          <p className="text-sm text-muted-foreground">Password (todos)</p>
          <p className="font-mono text-base font-semibold tracking-tight">
            {PASSWORD}
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="h-px w-full bg-border/80" aria-hidden />

        <ul className="space-y-3">
          {DEMO_CREDENTIALS.map((credential) => {
            const isThisLoading = loadingEmail === credential.email;
            
            return (
              <li key={credential.role}>
                <Button
                  variant={credential.variant}
                  className="w-full justify-between h-auto py-3 px-4"
                  onClick={() => handleQuickLogin(credential.email)}
                  disabled={isLoading}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-sm">
                      {credential.role}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="font-mono text-xs bg-background/50"
                    >
                      {credential.email}
                    </Badge>
                  </div>
                  
                  {isThisLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                </Button>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground text-center pt-2">
          💡 Solo visible en desarrollo
        </p>
      </CardContent>
    </Card>
  );
}

