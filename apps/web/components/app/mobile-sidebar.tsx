"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { NavLinks } from "@/components/app/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
        <SheetHeader className="h-14 flex-row items-center gap-2 border-b px-4 space-y-0">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
              Ş
            </div>
            <SheetTitle className="text-sm">Şahin</SheetTitle>
          </Link>
        </SheetHeader>
        <Separator />
        <div className="p-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
