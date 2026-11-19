"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Menu,
  ShoppingBag,
  X,
  ChevronRight,
  CircleHelp,
  Globe,
  LogOut,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/atoms/logo";
import { AccessGate, ApprovalWelcome } from "@/components/auth/access-gate";
import { GetAppButton, InstallBanner } from "@/components/organisms/get-app";
import { CartDrawer, useCartUi } from "@/components/cart/cart";
import { AppDensityContext } from "@/components/dashboard/kit";
import { formatINR } from "@/lib/format";
import { getService, GST_RATE } from "@/lib/mock-data";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Notifications } from "@/components/dashboard/notifications";
import { Tour, replayTour } from "@/components/dashboard/tour";
import { EASE } from "@/components/motion/motion";
import { useAccount, useApp, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Label under the icon in the mobile tab bar. */
  short?: string;
  /** The role's main action — raised in the centre of the mobile tab bar. */
  cta?: boolean;
  /** false = not in the mobile tab bar; reachable from the account sheet instead. */
  tab?: boolean;
  /** Small count shown next to the item (things that need attention). */
  badge?: number;
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
  user: fallbackUser,
  subtitle,
  nav,
  aside,
  children,
}: {
  role: Role;
  /** Fallback name before the signed-in account has loaded. */
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
  const signOut = useApp((s) => s.signOut);
  const reset = useApp((s) => s.reset);
  const ready = useApp((s) => s.ready);
  const account = useAccount();
  const pro = useApp((s) => s.pros.find((p) => p.id === account?.proId));
  const user = account?.name ?? fallbackUser;
  // RBAC: only an active account with this portal's role may use it.
  const allowed =
    !!account && account.role === role && account.status === "ACTIVE";

  // Customer + Professional are apps (Zepto/Blinkit style, full width); Admin is a website console.
  const isApp = role !== "admin";
  const [consoleMenu, setConsoleMenu] = useState(false);

  // Close the account sheet / console menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSheet(false);
    setConsoleMenu(false);
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
    {
      icon: Globe,
      label: "Website",
      onClick: () => router.push("/"),
    },
    {
      icon: RotateCcw,
      label: "Reset demo",
      onClick: () => {
        reset();
        toast.success("Demo data reset");
      },
    },
  ];

  /** Sign out of the demo portal and return to the login screen. */
  const logout = () => {
    setSheet(false);
    setConsoleMenu(false);
    signOut();
    toast.success("Logged out");
    router.push("/login");
  };

  if (ready && !allowed) return <AccessGate role={role} account={account} />;

  // ── App layout (customer + professional): sticky app header, desktop tab row,
  //    bottom tab bar on phones, compact type everywhere. No sidebar.
  if (isApp)
    return (
      <AppDensityContext.Provider value={true}>
        <div className="min-h-screen w-full bg-cream">
          <AppHeader
            role={role}
            user={user}
            email={account?.email}
            subtitle={subtitle}
            nav={nav}
            isActive={isActive}
            actions={actions}
            onLogout={logout}
            onOpenSheet={() => {
              tap();
              setSheet(true);
            }}
            onSearch={() => setPalette(true)}
          />
          <main data-app className="mx-auto w-full max-w-6xl px-4 pb-[calc(10rem+env(safe-area-inset-bottom))] pt-4 lg:px-6 lg:pb-24 lg:pt-6">
            <InstallBanner
              app={role === "customer" ? "customer" : "professional"}
            />
            {children}
          </main>
          {role === "customer" && (
            <>
              <BasketBar />
              <CartDrawer servicesHref="/customer/services" checkoutHref="/customer/checkout" />
            </>
          )}
          <MobileTabBar nav={nav} isActive={isActive} hidden={sheet || pathname.startsWith("/customer/checkout")} />
          <AccountSheet
            open={sheet}
            onClose={() => setSheet(false)}
            role={role}
            user={user}
            subtitle={subtitle}
            aside={aside}
            actions={actions}
            onLogout={logout}
            more={nav.filter((n) => n.tab === false)}
          />
          <CommandPalette
            open={palette}
            onOpenChange={setPalette}
            nav={nav}
            role={role}
          />
          <Tour role={role} />
          {role === "professional" && account?.approvalSeen === false && (
            <ApprovalWelcome account={account} pro={pro} onTour={replayTour} />
          )}
        </div>
      </AppDensityContext.Provider>
    );

  const ctaItem = nav.find((n) => n.cta);
  const menuItems = nav.filter((n) => !n.cta);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-cream">
      <div className="shrink-0 px-5 pb-5 pt-6">
        <Logo light />
        <div className="mt-3 flex items-center gap-2 pl-0.5 text-[12px] text-cream/55">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            aria-hidden
          />
          {roleLabel[role]} workspace
        </div>
      </div>

      {/* Main action first — one clear button instead of a menu item + a duplicate card */}
      {ctaItem && (
        <div className="shrink-0 px-4 pb-4">
          <Link
            href={ctaItem.href}
            data-tour="cta"
            className="group flex h-11 items-center justify-center gap-2 rounded-2xl bg-cream text-[14px] font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            <ctaItem.icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            {ctaItem.label}
          </Link>
        </div>
      )}

      {/* Menu + role card scroll together, so the profile below stays pinned on short screens */}
      <div
        data-lenis-prevent
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        <nav
          data-tour="tabs"
          className="space-y-0.5 px-3"
          aria-label={`${roleLabel[role]} navigation`}
        >
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-2 py-2 text-[14px] font-medium transition-colors",
                  active ? "text-ink" : "text-cream/70 hover:text-cream",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-2xl bg-cream"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                {!active && (
                  <span className="absolute inset-0 rounded-2xl bg-cream/0 transition-colors group-hover:bg-cream/6" />
                )}
                <span
                  className={cn(
                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-ink text-cream"
                      : "bg-cream/8 text-cream/75 group-hover:bg-cream/12 group-hover:text-cream",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="relative flex-1 truncate">{item.label}</span>
                {!!item.badge && (
                  <span
                    className={cn(
                      "relative min-w-5.5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums",
                      active ? "bg-ink text-cream" : "bg-cream/12 text-cream",
                    )}
                    aria-label={`${item.badge} need attention`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {aside && <div className="mt-auto px-3 pb-3 pt-6">{aside}</div>}
      </div>

      {/* Profile: who you are + log out, with quiet links underneath */}
      <div className="shrink-0 border-t border-cream/10 p-3">
        <div
          data-tour="account"
          className="flex items-center gap-3 rounded-2xl bg-cream/6 p-2.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-[12.5px] font-bold text-ink">
            {initials(user)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13.5px] font-semibold">{user}</div>
            <div className="mt-0.5 truncate text-[11.5px] text-cream/50">
              {subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-cream/60 transition-colors hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("flex min-h-screen w-full bg-cream")}>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen w-68 shrink-0",
          isApp ? "" : "lg:block",
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-8">
            {/* Mobile: avatar opens the account sheet, title names the current screen */}
            {!isApp && (
              <button
                type="button"
                onClick={() => setConsoleMenu((o) => !o)}
                aria-label={consoleMenu ? "Close menu" : "Open menu"}
                aria-expanded={consoleMenu}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/12 bg-paper text-ink lg:hidden"
              >
                {consoleMenu ? (
                  <X className="h-4.5 w-4.5" />
                ) : (
                  <Menu className="h-4.5 w-4.5" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                tap();
                setSheet(true);
              }}
              aria-label="Open account"
              data-tour="account"
              hidden={!isApp}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-cream transition-transform active:scale-90 lg:hidden"
            >
              {initials(user)}
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cream ring-2 ring-cream"
              >
                <ChevronDown className="h-3 w-3 text-ink" strokeWidth={2.6} />
              </span>
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

            {/* Desktop: where you are — role tile + current page */}
            <nav
              aria-label="Breadcrumb"
              className="hidden min-w-0 items-center gap-3 lg:flex"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-cream">
                <activeItem.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                  {roleLabel[role]}
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeItem.href}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="truncate text-[15px] font-bold tracking-[-0.01em] text-ink"
                  >
                    {activeItem.label}
                  </motion.div>
                </AnimatePresence>
              </div>
            </nav>

            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label="Search or jump to"
              data-tour="search"
              className="group ml-auto flex h-10 w-10 shrink-0 items-center justify-center gap-2.5 rounded-full border border-ink/10 bg-paper text-[13.5px] text-ink/50 transition-all hover:border-ink/25 hover:shadow-[0_6px_20px_-12px_rgba(40,43,74,0.45)] active:scale-95 lg:w-80 lg:justify-start lg:pl-4 lg:pr-2 xl:w-96"
            >
              <Search className="h-4 w-4 shrink-0 text-ink/45 transition-colors group-hover:text-ink" />
              <span className="hidden truncate lg:inline">
                Search pages, bookings, people…
              </span>
              <span
                className="ml-auto hidden items-center gap-1 lg:flex"
                aria-hidden
              >
                <kbd className="rounded-md border border-ink/12 bg-cream px-1.5 py-0.5 font-mono text-[10px] text-ink/55">
                  Ctrl
                </kbd>
                <kbd className="rounded-md border border-ink/12 bg-cream px-1.5 py-0.5 font-mono text-[10px] text-ink/55">
                  K
                </kbd>
              </span>
            </button>

            {/* Desktop: one status pill instead of a loose clock + dashed tag */}
            <div
              className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-paper px-3.5 text-[12.5px] text-ink/65 xl:flex"
              title="Demo data · India time"
            >
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              <span className="font-medium text-ink/80">Demo</span>
              <span className="text-ink/25">·</span>
              <LiveClock />
            </div>

            <Notifications role={role} />

            {/* Phone: quick log out next to the bell (desktop uses the account menu) */}
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink/70 transition-colors hover:border-ink/30 hover:text-ink active:scale-95 lg:hidden"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <AccountMenu
              user={user}
              email={account?.email}
              subtitle={subtitle}
              role={role}
              actions={actions}
              onLogout={logout}
            />
          </div>
        </header>

        {!isApp && (
          <ConsoleMobileMenu
            open={consoleMenu}
            onClose={() => setConsoleMenu(false)}
            nav={nav}
            isActive={isActive}
            user={user}
            actions={actions}
            onLogout={logout}
          />
        )}

        {/* Bottom padding keeps the last card clear of the floating tab bar on phones */}
        <main
          className={cn(
            "mx-auto w-full max-w-7xl flex-1 px-4 pt-6 lg:px-10 lg:py-10",
            isApp ? "pb-[calc(7.5rem+env(safe-area-inset-bottom))]" : "pb-12",
          )}
        >
          {children}
        </main>
      </div>

      {isApp && <MobileTabBar nav={nav} isActive={isActive} hidden={sheet} />}
      <AccountSheet
        open={sheet}
        onClose={() => setSheet(false)}
        role={role}
        user={user}
        subtitle={subtitle}
        aside={aside}
        actions={actions}
        onLogout={logout}
        more={nav.filter((n) => n.tab === false)}
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

/* ───────────── Apps: header (location / status · search · basket · account) ───────────── */
function AppHeader({
  role,
  user,
  email,
  subtitle,
  nav,
  isActive,
  actions,
  onLogout,
  onOpenSheet,
  onSearch,
}: {
  role: Role;
  user: string;
  email?: string;
  subtitle: string;
  nav: NavItem[];
  isActive: (href: string) => boolean;
  actions: { icon: LucideIcon; label: string; onClick: () => void }[];
  onLogout: () => void;
  onOpenSheet: () => void;
  onSearch: () => void;
}) {
  const addresses = useApp((s) => s.addresses);
  const home = addresses[0];
  const cta = nav.find((n) => n.cta);
  const tabs = nav.filter((n) => !n.cta && n.tab !== false);
  const more = nav.filter((n) => n.tab === false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-cream/92 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 lg:gap-5 lg:px-6">
        <div className="hidden lg:block">
          <Logo />
        </div>

        {role === "customer" ? (
          <Link
            href="/customer/addresses"
            className="group min-w-0 text-left lg:border-l lg:border-ink/10 lg:pl-5"
            aria-label="Change booking address"
          >
            <div className="text-[11.5px] font-medium text-ink/55">
              Booking for · {home?.label ?? "Home"}
            </div>
            <div className="flex items-center gap-1 text-[15px] font-bold tracking-tight text-ink">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {home ? `${home.zone}, Ahmedabad` : "Add your address"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink/50 transition-transform group-hover:translate-y-0.5" />
            </div>
          </Link>
        ) : (
          <Link
            href="/professional/availability"
            className="min-w-0 text-left lg:border-l lg:border-ink/10 lg:pl-5"
            aria-label="Working hours and status"
          >
            <div className="text-[11.5px] font-medium text-ink/55">
              {subtitle}
            </div>
            <div className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-ink">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              <span className="truncate">Accepting jobs</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-ink/50" />
            </div>
          </Link>
        )}

        <AppSearch
          role={role}
          onSearch={onSearch}
          className="mx-auto hidden max-w-xl flex-1 lg:flex"
        />

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <div className="hidden lg:block xl:hidden">
            <GetAppButton
              app={role === "customer" ? "customer" : "professional"}
              compact
            />
          </div>
          <div className="hidden xl:block">
            <GetAppButton
              app={role === "customer" ? "customer" : "professional"}
            />
          </div>
          <Notifications role={role} />
          {role === "customer" && <BasketButton />}
          <button
            type="button"
            onClick={onOpenSheet}
            aria-label="Open account"
            data-tour="account"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-cream transition-transform active:scale-90 lg:hidden"
          >
            {initials(user)}
          </button>
          <AccountMenu
            user={user}
            email={email}
            subtitle={subtitle}
            role={role}
            actions={actions}
            onLogout={onLogout}
          />
        </div>
      </div>

      {/* phones: full-width search under the location, like Blinkit */}
      <div className="px-4 pb-3 lg:hidden">
        <AppSearch role={role} onSearch={onSearch} className="flex" />
      </div>

      {/* desktop: tab row instead of a sidebar */}
      <div className="hidden border-t border-ink/6 lg:block">
        <nav
          data-tour="tabs"
          aria-label={`${roleLabel[role]} navigation`}
          className="mx-auto flex h-12 w-full max-w-6xl items-center gap-1 px-6"
        >
          {[...tabs, ...more].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-12 items-center gap-2 px-3 text-[14px] font-semibold transition-colors",
                  active ? "text-ink" : "text-ink/55 hover:text-ink",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {!!item.badge && (
                  <span className="rounded-full bg-ink px-1.5 py-px text-[11px] font-bold leading-4 text-cream">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="app-tab-underline"
                    className="absolute inset-x-3 bottom-0 h-0.75 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </Link>
            );
          })}
          {cta && (
            <Link
              href={cta.href}
              data-tour="cta"
              className="ml-auto flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-cream transition-transform active:scale-95"
            >
              <cta.icon className="h-4 w-4" />
              {cta.label}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

const SEARCH_HINTS = [
  "AC service",
  "tap repair",
  "deep cleaning",
  "fan installation",
  "pest control",
  "wall painting",
];

/** Customer: search services (goes to the catalogue). Pro: jump to jobs/pages. */
function AppSearch({
  role,
  onSearch,
  className,
}: {
  role: Role;
  onSearch: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hint, setHint] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setHint((h) => (h + 1) % SEARCH_HINTS.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  if (role !== "customer")
    return (
      <button
        type="button"
        onClick={onSearch}
        data-tour="search"
        className={cn(
          "h-11 w-full items-center gap-2.5 rounded-xl border border-ink/10 bg-white px-3.5 text-left text-[14px] text-ink/50 transition-colors hover:border-ink/25",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search jobs, customers, pages…</span>
      </button>
    );

  return (
    <form
      role="search"
      data-tour="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          q.trim()
            ? `/customer/services?q=${encodeURIComponent(q.trim())}`
            : "/customer/services",
        );
      }}
      className={cn(
        "relative h-11 w-full items-center rounded-xl border border-ink/10 bg-white transition-colors focus-within:border-ink/35",
        className,
      )}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search services"
        className="h-full w-full rounded-xl bg-transparent pl-10 pr-3 text-[14px] text-ink outline-none"
      />
      {!q && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-10 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[14px] text-ink/45"
        >
          Search for
          <span className="relative inline-block h-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hint}
                className="block font-medium text-ink/60"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                “{SEARCH_HINTS[hint]}”
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      )}
    </form>
  );
}

function useBasket() {
  const cart = useApp((s) => s.cart);
  const items = cart
    .map((slug) => getService(slug))
    .filter((x): x is NonNullable<ReturnType<typeof getService>> => !!x);
  const subtotal = items.reduce((sum, s) => sum + s.pricePaise, 0);
  return { items, subtotal };
}

function BasketButton() {
  const { items, subtotal } = useBasket();
  const filled = items.length > 0;
  const openBasket = useCartUi((st) => st.setOpen);
  return (
    <button
      type="button"
      onClick={() => openBasket(true)}
      aria-label={`Basket, ${items.length} ${items.length === 1 ? "service" : "services"}`}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:w-auto lg:gap-2 lg:rounded-xl lg:px-3",
        filled ? "border-ink/10 bg-white text-ink lg:border-emerald-700 lg:bg-emerald-700 lg:text-white lg:hover:bg-emerald-800" : "border-ink/10 bg-white text-ink hover:border-ink/25",
      )}
    >
      <ShoppingBag className="h-4.5 w-4.5" />
      {filled ? (
        <span className="hidden text-left text-[12.5px] font-bold leading-tight lg:block">
          {items.length} {items.length === 1 ? "service" : "services"}
          <span className="block text-[12px] font-semibold opacity-90">{formatINR(subtotal)}</span>
        </span>
      ) : (
        <span className="hidden text-[13px] font-semibold lg:inline">Basket</span>
      )}
      {filled && (
        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[10.5px] font-bold text-cream lg:hidden">
          {items.length}
        </span>
      )}
    </button>
  );
}

/** Sticky "View basket" bar, like the cart bar in Blinkit / Zepto. Opens the basket. */
function BasketBar() {
  const { items, subtotal } = useBasket();
  const pathname = usePathname();
  // Service detail, booking detail + checkout have their own bottom action bar.
  const ownBar =
    pathname.startsWith("/customer/checkout") ||
    (/^\/customer\/(services|bookings)\//.test(pathname) && pathname.split("/").length === 4);
  const openBasket = useCartUi((st) => st.setOpen);
  return (
    <AnimatePresence>
      {items.length > 0 && !ownBar && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-40 lg:hidden"
        >
          <button
            type="button"
            onClick={() => openBasket(true)}
            className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-emerald-700 text-left px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(4,80,50,0.6)] transition-transform active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <ShoppingBag className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[13.5px] font-bold">
                {items.length} {items.length === 1 ? "service" : "services"} ·{" "}
                {formatINR(subtotal)}
              </span>
              <span className="block text-[11.5px] text-white/75">
                + {GST_RATE * 100}% GST · one visit time, one payment
              </span>
            </span>
            <span className="flex items-center gap-1 text-[14px] font-bold">
              View basket <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────── Admin on a phone: website-style menu ───────────── */
function ConsoleMobileMenu({
  open,
  onClose,
  nav,
  isActive,
  user,
  actions,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  isActive: (href: string) => boolean;
  user: string;
  actions: { icon: LucideIcon; label: string; onClick: () => void }[];
  onLogout: () => void;
}) {
  const [noteHidden, setNoteHidden] = useState(false);
  return (
    <div className="lg:hidden">
      {!noteHidden && (
        <div className="flex items-center gap-3 border-b border-ink/10 bg-paper px-4 py-2.5 text-[12.5px] text-ink/70">
          <span className="flex-1">
            The operations console works best on a laptop or desktop.
          </span>
          <button
            type="button"
            onClick={() => setNoteHidden(true)}
            aria-label="Dismiss"
            className="rounded-full p-1 text-ink/45 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 top-14 z-20 bg-ink/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.nav
              aria-label="Operations menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-30 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-ink/10 bg-cream px-4 pb-5 pt-3 shadow-[0_24px_40px_-24px_rgba(40,43,74,0.4)]"
            >
              <ul className="space-y-1">
                {nav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium",
                          active
                            ? "bg-ink text-cream"
                            : "text-ink hover:bg-ink/5",
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5" />
                        <span className="flex-1">{item.label}</span>
                        {!!item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                              active
                                ? "bg-cream text-ink"
                                : "bg-ink text-cream",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 border-t border-ink/10 pt-3">
                <div className="flex flex-wrap gap-2">
                  {actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => (onClose(), a.onClick())}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 px-3 text-[13px] text-ink/75"
                    >
                      <a.icon className="h-3.5 w-3.5" /> {a.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-semibold text-cream"
                >
                  <LogOut className="h-4 w-4" /> Log out {user.split(" ")[0]}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── Desktop: account menu ───────────── */
function AccountMenu({
  user,
  email,
  subtitle,
  role,
  actions,
  onLogout,
}: {
  user: string;
  email?: string;
  subtitle: string;
  role: Role;
  actions: { icon: LucideIcon; label: string; onClick: () => void }[];
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden shrink-0 lg:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        data-tour="account"
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-full border bg-paper py-1 pl-1 pr-3 transition-all hover:border-ink/25",
          open
            ? "border-ink/30 shadow-[0_6px_20px_-12px_rgba(40,43,74,0.45)]"
            : "border-ink/10",
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11.5px] font-bold text-cream">
          {initials(user)}
        </span>
        <span className="hidden max-w-36 text-left leading-tight 2xl:block">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {user}
          </span>
          <span className="block truncate text-[11px] text-ink/50">
            {roleLabel[role]}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink/50 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-[0_24px_60px_-24px_rgba(40,43,74,0.45)]"
          >
            <div className="flex items-center gap-3 border-b border-ink/8 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-[13px] font-bold text-cream">
                {initials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-semibold text-ink">
                  {user}
                </div>
                <div className="truncate text-[12px] text-ink/55">
                  {email || subtitle}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-ink/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/60">
                {roleLabel[role]}
              </span>
            </div>
            <ul className="p-1.5">
              {actions.map((a) => (
                <li key={a.label}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      a.onClick();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <a.icon className="h-4 w-4 text-ink/50" />
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/8 p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-rose-700 transition-colors hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const inBar = nav.filter((n) => n.tab !== false);
  const cta = inBar.find((n) => n.cta);
  const rest = inBar.filter((n) => n !== cta);
  const tabs = cta ? [...rest.slice(0, 2), cta, ...rest.slice(2)] : inBar;

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
        className="mx-auto flex h-17 max-w-md items-stretch rounded-[26px] bg-ink/95 px-1.5 text-cream shadow-[0_20px_50px_-15px_rgba(40,43,74,0.6)] ring-1 ring-cream/10 backdrop-blur-xl"
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
                    className="absolute inset-x-1 inset-y-1.5 rounded-[18px] bg-cream/12"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-cream" : "text-cream/50",
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  {!!item.badge && (
                    <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-cream px-1 text-center text-[9.5px] font-bold leading-4 text-ink">
                      {item.badge}
                    </span>
                  )}
                </span>
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
  onLogout,
  more,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  user: string;
  subtitle: string;
  aside?: ReactNode;
  actions: { icon: LucideIcon; label: string; onClick: () => void }[];
  onLogout: () => void;
  more: NavItem[];
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

            {more.length > 0 && (
              <ul className="mt-4 overflow-hidden rounded-2xl bg-cream/6">
                {more.map((item, i) => (
                  <li
                    key={item.href}
                    className={cn(i > 0 && "border-t border-cream/10")}
                  >
                    <Link
                      href={item.href}
                      onClick={tap}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-medium transition-colors active:bg-cream/8"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cream text-ink">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-cream/35" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-4 overflow-hidden rounded-2xl bg-cream/6">
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
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-medium transition-colors active:bg-cream/8"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cream/8">
                      <a.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{a.label}</span>
                    <ChevronRight className="h-4 w-4 text-cream/35" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                tap();
                onLogout();
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-cream py-3.5 text-[15px] font-semibold text-ink transition-transform active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>

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
  const compact = useContext(AppDensityContext);
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between",
        compact ? "mb-5 gap-3" : "mb-8 gap-4",
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            "text-ink",
            compact
              ? "text-[22px] font-bold leading-tight tracking-tight"
              : "text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-tighter",
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-1 max-w-2xl text-ink/60",
              compact ? "text-[14px]" : "mt-2 text-[15px]",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
