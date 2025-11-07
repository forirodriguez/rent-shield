"use client";

import { useSession } from "next-auth/react";
import { LogoutButton } from "./logout-button";
import Link from "next/link";
import Image from "next/image";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium text-gray-900">{session.user.name}</p>
          <p className="text-xs text-gray-500">{session.user.role}</p>
        </div>
      </div>
      <LogoutButton variant="outline" />
    </div>
  );
}
