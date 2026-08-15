import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  History,
  KeyRound,
  LogOut,
  Mail,
  Package,
  Server,
  ServerCog,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV = [
  { to: "/", label: "Dasbor", icon: CalendarClock },
  { to: "/smtp", label: "SMTP", icon: Server },
  { to: "/logs", label: "Riwayat", icon: History },
] as const;

const DOCS = [
  { to: "/export", label: "Export", icon: Package },
  { to: "/hosting-guide", label: "Hosting", icon: ServerCog },
  { to: "/env-guide", label: "Env", icon: KeyRound },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: readonly { to: string; label: string; icon: typeof Mail }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={isActive(pathname, item.to)} tooltip={item.label}>
                <Link to={item.to}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [timedOut, setTimedOut] = useState(false);

  // Kalau pengecekan sesi tidak selesai (misalnya backend tak terjangkau dari
  // hosting statis), jangan berputar selamanya — lempar ke halaman login.
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if ((ready && !session) || (timedOut && !session)) void navigate({ to: "/auth" });
  }, [ready, timedOut, session, navigate]);

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
        <span>{timedOut ? "Tidak dapat memeriksa sesi." : "Memuat…"}</span>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link to="/auth">Ke halaman masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/" className="flex min-w-0 items-center gap-3 px-1 py-1.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Mail className="h-4 w-4" />
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate font-display text-base leading-tight font-semibold">
                Reminder Mail
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Penjadwal email SMTP
              </span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <NavGroup label="Kelola" items={NAV} pathname={pathname} />
          <NavGroup label="Panduan" items={DOCS} pathname={pathname} />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Keluar"
                onClick={async () => {
                  await signOut();
                  void navigate({ to: "/auth" });
                }}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
          <span className={cn("truncate text-sm font-medium")}>
            {[...NAV, ...DOCS].find((i) => isActive(pathname, i.to))?.label ?? "Reminder Mail"}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-xs text-muted-foreground sm:px-6">
          Pengingat email terjadwal · zona waktu Asia/Jakarta
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
