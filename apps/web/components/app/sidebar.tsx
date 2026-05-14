import Link from "next/link";

import { NavLinks } from "@/components/app/nav-links";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
            Ş
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Şahin</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Job Radar
            </span>
          </div>
        </Link>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks />
      </div>
      <div className="border-t p-3 text-xs text-sidebar-foreground/60">
        Phase 1.0 — Foundation
      </div>
    </aside>
  );
}
