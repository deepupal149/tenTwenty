"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Top bar: brand + main nav + signed-in user dropdown. */
export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const userName = session?.user?.name ?? "John Doe";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-[24px] font-bold text-gray-900"
          >
            ticktock
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <span className="font-medium text-gray-900">Timesheets</span>
          </nav>
        </div>

        <div className="relative" ref={menuContainerRef}>
          <Button
            type="button"
            variant="ghost"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((previousIsMenuOpen) => !previousIsMenuOpen)}
            className="gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            {userName}
            <ChevronDown className="h-4 w-4" />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <Button
                type="button"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2 font-normal text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
