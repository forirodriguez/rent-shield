"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { twMerge } from "tailwind-merge";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      // Client component para signOut: evita un roundtrip extra usando Server Actions.
      void signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={twMerge(
        "inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9l3-3m0 0l3 3m-3-3v12"
        />
      </svg>
      {isPending ? "Finalizando..." : "Cerrar sesión"}
    </button>
  );
}
