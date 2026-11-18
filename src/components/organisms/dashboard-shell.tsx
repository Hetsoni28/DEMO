"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  CircleHelp,
  Globe,
  LogOut,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/atoms/logo";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Notifications } from "@/components/dashboard/notifications";
import { Tour, replayTour } from "@/components/dashboard/tour";
import { EASE } from "@/components/motion/motion";
import { useApp, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Label under the icon in the mobile tab bar. */
  short?: string;
  /** The role's main action — raised in the centre of the mobile tab bar. */
  cta?: boolean;
};

const roleLabel: Record<Role, string> = {
  customer: "Customer",
  professional: "Professional",
  admin: "Operations",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

/** A tiny tap on phones that support it — app-like feedback, silently ignored elsewhere. */
function tap() {
  try {
    navigator.vibrate?.(8);
  } catch {}
}

function LiveClock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
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
  /** Role-specific card shown in the sidebar (desktop) and the account sheet (mobile). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheet, setSheet] = useState(false);
  const [palette, setPalette] = useState(false);
  const setRole = useApp((s) => s.setRole);
  const reset = useApp((s) => s.reset);
  const current = useApp((s) => s.role);
  const ready = useApp((s) => s.ready);

  // Demo "auth": visiting a portal signs you in as that role.
  useEffect(() => {
    if (ready && current !== role) setRole(role);
  }, [ready, current, role, setRole]);

  // Close the account sheet on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSheet(false);
  }

  const isActive = (href: string) =>
    pathname === href || (href !== nav[0].href && pathname.startsWith(href));
  const activeItem = nav.find((n) => isActive(n.href)) ?? nav[0];

  const actions = [
    {
      icon: CircleHelp,
      label: "How it works",
      onClick: () => setTimeout(replayTour, 450),
    },
    { icon: Globe, label: "Website", onClick: () => router.push("/") },
    {
      icon: RotateCcw,
      label: "Reset demo",
      onClick: () => {
        reset();
        toast.success("Demo data reset");
      },
    },
    {
      icon: LogOut,
      label: "Switch role",
      onClick: () => {
        setRole(null);
        router.push("/login");
      },
    },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-cream">
      <div className="flex items-center justify-between px-6 pb-6 pt-6">
        <Logo light />
        <span className="rounded-full border border-cream/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/70">
          {roleLabel[role]}
        </span>
      </div>

      <div className="px-6 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/40">
        Workspace
      </div>
      <nav
        data-tour="tabs"
        className="flex-1 space-y-1 overflow-y-auto px-3"
        aria-label={`${roleLabel[role]} navigation`}
      >
        {nav.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.cta ? "cta" : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                active ? "text-ink" : "text-cream/70 hover:text-cream",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill-desktop"
                  className="absolute inset-0 rounded-2xl bg-cream"
                  transition={{ duration: 0.45, ease: EASE }}
                />
              )}
              {!active && (
                <span className="absolute inset-0 rounded-2xl bg-cream/0 transition-colors group-hover:bg-cream/[0.06]" />
              )}
              <span
                className={cn(
                  "relative w-6 font-mono text-[10.5px]",
                  active ? "text-ink/45" : "text-cream/35",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <item.icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {aside && <div className="px-3 pb-3">{aside}</div>}

      <div className="border-t border-cream/10 p-3">
        <div
          data-tour="account"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-ink">
            {initials(user)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold">{user}</div>
            <div className="truncate text-[12px] text-cream/50">{subtitle}</div>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] text-cream/55 transition-colors hover:bg-cream/[0.06] hover:text-cream"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label === "How it works" ? "Guide" : a.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-8">
            {/* Mobile: avatar opens the account sheet, title names the current screen */}
            <button
              type="button"
              onClick={() => {
                tap();
                setSheet(true);
              }}
              aria-label="Open account"
              data-tour="account"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-cream transition-transform active:scale-90 lg:hidden"
            >
              {initials(user)}
            </button>
            <div className="min-w-0 lg:hidden">
              <div className="font-mono text-[9.5px] uppercase leading-none tracking-[0.16em] text-ink/45">
                {roleLabel[role]}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeItem.href}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="mt-1 truncate text-[16px] font-bold leading-none tracking-[-0.02em] text-ink"
                >
                  {activeItem.label}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 lg:flex">
              <span>{roleLabel[role]}</span>
              <span className="text-ink/25">/</span>
              <span className="truncate text-ink">{activeItem.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label="Search or jump to"
              data-tour="search"
              className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center gap-2.5 rounded-full border border-ink/10 bg-paper text-[13px] text-ink/50 transition-colors hover:border-ink/30 active:scale-95 lg:w-[300px] lg:justify-start lg:px-4"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden truncate lg:inline">
                Search or jump to…
              </span>
              <kbd className="ml-auto hidden rounded-md border border-ink/15 px-1.5 py-0.5 font-mono text-[10px] text-ink/50 lg:inline">
                Ctrl K
              </kbd>
            </button>

            <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50 xl:inline">
              <LiveClock /> IST
            </span>
            <Notifications role={role} />
            <span className="hidden rounded-full border border-dashed border-ink/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55 md:inline">
              Demo
            </span>
          </div>
        </header>

        {/* Bottom padding keeps the last card clear of the floating tab bar on phones */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      <MobileTabBar nav={nav} isActive={isActive} hidden={sheet} />
      <AccountSheet
        open={sheet}
        onClose={() => setSheet(false)}
        role={role}
        user={user}
        subtitle={subtitle}
        aside={aside}
        actions={actions}
      />
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        nav={nav}
        role={role}
      />
      <Tour role={role} />
    </div>
  );
}

/* ───────────── Mobile: floating tab bar ───────────── */
function MobileTabBar({
  nav,
  isActive,
  hidden,
}: {
  nav: NavItem[];
  isActive: (href: string) => boolean;
  hidden: boolean;
}) {
  // The role's main action sits raised in the centre; the rest keep their order around it.
  const cta = nav.find((n) => n.cta);
  const rest = nav.filter((n) => n !== cta);
  const tabs = cta ? [...rest.slice(0, 2), cta, ...rest.slice(2)] : nav;

  return (
    <motion.nav
      aria-label="Primary"
      initial={false}
      animate={{ y: hidden ? 120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <ul
        data-tour="tabs"
        className="mx-auto flex h-[68px] max-w-md items-stretch rounded-[26px] bg-ink/95 px-1.5 text-cream shadow-[0_20px_50px_-15px_rgba(40,43,74,0.6)] ring-1 ring-cream/10 backdrop-blur-xl"
      >
        {tabs.map((item) => {
          const active = isActive(item.href);
          const label = item.short ?? item.label;
          if (item.cta)
            return (
              <li key={item.href} className="flex flex-1 justify-center">
                <Link
                  href={item.href}
                  onClick={tap}
                  data-tour="cta"
                  aria-current={active ? "page" : undefined}
                  className="group -mt-5 flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-[20px] shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] ring-4 ring-cream transition-transform duration-200 group-active:scale-90",
                      active ? "bg-cream text-ink" : "bg-cream text-ink",
                    )}
                  >
                    <item.icon className="h-6 w-6" strokeWidth={2.2} />
                  </span>
                  <span className="text-[10.5px] font-semibold leading-none text-cream">
                    {label}
                  </span>
                </Link>
              </li>
            );
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                onClick={tap}
                aria-current={active ? "page" : undefined}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[20px] transition-transform duration-200 active:scale-90"
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-x-1 inset-y-1.5 rounded-[18px] bg-cream/[0.12]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative h-5 w-5 transition-colors",
                    active ? "text-cream" : "text-cream/50",
                  )}
                  strokeWidth={active ? 2.3 : 1.9}
                />
                <span
                  className={cn(
                    "relative text-[10.5px] leading-none transition-colors",
                    active ? "font-semibold text-cream" : "text-cream/50",
                  )}
                >
                  {label}
                </span>
                {active && (
                  <motion.span
                    layoutId="tab-dot"
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-cream"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}

/* ───────────── Mobile: account sheet ───────────── */
function AccountSheet({
  open,
  onClose,
  role,
  user,
  subtitle,
  aside,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  user: string;
  subtitle: string;
  aside?: ReactNode;
  actions: { icon: LucideIcon; label: string; onClick: () => void }[];
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Account"
        >
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            data-lenis-prevent
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 38 }
            }
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 600) onClose();
            }}
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[30px] bg-ink px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 text-cream shadow-2xl"
          >
            <div
              className="mx-auto mb-5 h-1.5 w-11 rounded-full bg-cream/25"
              aria-hidden
            />

            <div className="flex items-center gap-3.5 px-1">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-cream text-[17px] font-black text-ink">
                {initials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[18px] font-bold tracking-[-0.02em]">
                  {user}
                </div>
                <div className="truncate text-[13px] text-cream/55">
                  {subtitle}
                </div>
              </div>
              <span className="rounded-full border border-cream/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/70">
                {roleLabel[role]}
              </span>
            </div>

            {aside && <div className="mt-5">{aside}</div>}

            <ul className="mt-4 overflow-hidden rounded-2xl bg-cream/[0.06]">
              {actions.map((a, i) => (
                <li
                  key={a.label}
                  className={cn(i > 0 && "border-t border-cream/10")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      tap();
                      onClose();
                      a.onClick();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-medium transition-colors active:bg-cream/[0.08]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cream/[0.08]">
                      <a.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{a.label}</span>
                    <ChevronRight className="h-4 w-4 text-cream/35" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/35">
              <span>HomeCrew · demo build</span>
              <span>Swipe down to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Editorial page title used by inner dashboard pages. */
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.05em] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[15px] text-ink/60">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
