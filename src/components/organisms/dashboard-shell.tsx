"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Globe, LogOut, Menu, RotateCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/atoms/logo";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Notifications } from "@/components/dashboard/notifications";
import { EASE } from "@/components/motion/motion";
import { useApp, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: LucideIcon };

const roleLabel: Record<Role, string> = { customer: "Customer", professional: "Professional", admin: "Operations" };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function LiveClock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const tick = () => setT(fmt.format(new Date()));
    const first = setTimeout(tick, 0);
    const iv = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, []);
  return <span className="tabular-nums">{t ?? "—"}</span>;
}

export function DashboardShell({
  role,
  user,
  subtitle,
  nav,
  aside,
  children,
}: {
  role: Role;
  user: string;
  subtitle: string;
  nav: NavItem[];
  /** Role-specific card shown above the user block in the sidebar. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const setRole = useApp((s) => s.setRole);
  const reset = useApp((s) => s.reset);
  const current = useApp((s) => s.role);
  const ready = useApp((s) => s.ready);

  // Demo "auth": visiting a portal signs you in as that role.
  useEffect(() => {
    if (ready && current !== role) setRole(role);
  }, [ready, current, role, setRole]);

  // Close the mobile drawer on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => pathname === href || (href !== nav[0].href && pathname.startsWith(href));
  const activeItem = nav.find((n) => isActive(n.href)) ?? nav[0];

  const sidebar = (layoutId: string) => (
    <div className="flex h-full flex-col bg-ink text-cream">
      <div className="flex items-center justify-between px-6 pb-6 pt-6">
        <Logo light />
        <span className="rounded-full border border-cream/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/70">{roleLabel[role]}</span>
      </div>

      <div className="px-6 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/40">Workspace</div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label={`${roleLabel[role]} navigation`}>
        {nav.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-colors", active ? "text-ink" : "text-cream/70 hover:text-cream")}
            >
              {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-2xl bg-cream" transition={{ duration: 0.45, ease: EASE }} />}
              {!active && <span className="absolute inset-0 rounded-2xl bg-cream/0 transition-colors group-hover:bg-cream/[0.06]" />}
              <span className={cn("relative w-6 font-mono text-[10.5px]", active ? "text-ink/45" : "text-cream/35")}>{String(i + 1).padStart(2, "0")}</span>
              <item.icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {aside && <div className="px-3 pb-3">{aside}</div>}

      <div className="border-t border-cream/10 p-3">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-ink">{initials(user)}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold">{user}</div>
            <div className="truncate text-[12px] text-cream/50">{subtitle}</div>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {[
            { icon: Globe, label: "Website", onClick: () => router.push("/") },
            {
              icon: RotateCcw,
              label: "Reset",
              onClick: () => {
                reset();
                toast.success("Demo data reset");
              },
            },
            {
              icon: LogOut,
              label: "Switch",
              onClick: () => {
                setRole(null);
                router.push("/login");
              },
            },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] text-cream/55 transition-colors hover:bg-cream/[0.06] hover:text-cream"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 lg:block">{sidebar("nav-pill-desktop")}</aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-[292px] shadow-2xl" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.4, ease: EASE }}>
              {sidebar("nav-pill-mobile")}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute -right-12 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink">
                <X className="h-4 w-4" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 sm:flex">
              <span>{roleLabel[role]}</span>
              <span className="text-ink/25">/</span>
              <span className="truncate text-ink">{activeItem.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setPalette(true)}
              className="ml-auto flex h-10 min-w-0 items-center gap-2.5 rounded-full border border-ink/10 bg-paper px-4 text-[13px] text-ink/50 transition-colors hover:border-ink/30 sm:w-[300px]"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden truncate sm:inline">Search or jump to…</span>
              <kbd className="ml-auto hidden rounded-md border border-ink/15 px-1.5 py-0.5 font-mono text-[10px] text-ink/50 sm:inline">Ctrl K</kbd>
            </button>

            <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50 xl:inline">
              <LiveClock /> IST
            </span>
            <Notifications role={role} />
            <span className="hidden rounded-full border border-dashed border-ink/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55 md:inline">Demo</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>

      <CommandPalette open={palette} onOpenChange={setPalette} nav={nav} role={role} />
    </div>
  );
}

/** Editorial page title used by inner dashboard pages. */
export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-ink/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}
