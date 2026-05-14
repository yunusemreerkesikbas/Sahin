import { MobileSidebar } from "@/components/app/mobile-sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MobileSidebar />
      <div className="flex-1" />
      <ThemeToggle />
      <Avatar>
        <AvatarFallback>YE</AvatarFallback>
      </Avatar>
    </header>
  );
}
