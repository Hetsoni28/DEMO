"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronDown, Plus, QrCode, ShieldCheck } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { Logo } from "@/components/atoms/logo";
import { CartButton } from "@/components/cart/cart";
import { EASE, Magnetic } from "@/components/motion/motion";
import { formatINR } from "@/lib/format";
import { companyMenu, primaryNav, serviceMenu } from "@/lib/navigation";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const dashFor = { customer: "/customer/dashboard", professional: "/professional/dashboard", admin: "/admin/dashboard" } as const;
type MenuKey = "services" | "company";

/* ───────────── Announcement bar ───────────── */
function Announcement() {
  return (
    <div className="h-9 bg-ink text-cream">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5 text-[12px] sm:px-8">
        <span className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cream/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cream" />
          </span>
          <span className="truncate">
            Now booking in Ahmedabad <span className="hidden text-cream/55 sm:inline">· Verified pros, prices fixed before you pay</span>
          </span>
        </span>
        <Link href="/#how-it-works" className="group hidden shrink-0 items-center gap-1 font-medium text-cream/80 hover:text-cream sm:inline-flex">
          How booking works
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ───────────── Desktop mega menus ───────────── */
function ServicesPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">Home services</span>
          <Link href="/services" onClick={onNavigate} className="link-underline pb-0.5 text-[13px] font-medium text-ink">
            View all {serviceMenu.reduce((n, s) => n + s.count, 0)} services
          </Link>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-1 xl:grid-cols-3">
          {serviceMenu.map((s, i) => {
            const Icon = categoryIcons[s.icon];
            return (
              <motion.li key={s.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.03 * i }}>
                <Link href={s.href} onClick={onNavigate} className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-cream focus-visible:bg-cream">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-paper text-ink transition-all duration-500 group-hover:-rotate-6 group-hover:bg-ink group-hover:text-cream">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                      {s.label}
                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-ink/55">{s.description}</span>
                    <span className="mt-1.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/40">
                      {s.count} svc · from {formatINR(s.fromPaise)}
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="relative flex flex-col overflow-hidden rounded-[24px] bg-ink p-6 text-cream"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/50">Book in 60 sec</span>
        <p className="mt-3 text-[26px] font-bold leading-[1.02] tracking-[-0.04em]">Real slots. Fixed price. QR at the door.</p>
        <ul className="mt-5 space-y-2 text-[13px] text-cream/75">
          <li className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" /> Background-verified professionals
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Pay only after server-verified booking
          </li>
          <li className="flex items-center gap-2">
            <QrCode className="h-4 w-4" /> One-time service QR
          </li>
        </ul>
        <Link
          href="/services"
          onClick={onNavigate}
          className="group mt-auto inline-flex h-11 items-center justify-between rounded-full bg-cream pl-5 pr-1.5 text-[14px] font-semibold text-ink"
        >
          Book a service
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

function CompanyPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <ul className="grid gap-1">
      {companyMenu.map((l, i) => (
        <motion.li key={l.href} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 0.04 * i }}>
          <Link href={l.href} onClick={onNavigate} className="group flex items-start justify-between gap-4 rounded-2xl p-3.5 transition-colors hover:bg-cream focus-visible:bg-cream">
            <span>
              <span className="block text-[14px] font-semibold text-ink">{l.label}</span>
              <span className="mt-0.5 block text-[12.5px] text-ink/55">{l.description}</span>
            </span>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink/40 transition-all duration-300 group-hover:rotate-45 group-hover:text-ink" />
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

/* ───────────── Header ───────────── */
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const role = useApp((s) => s.role);
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();

  // The navbar always stays visible; scrolling only switches it to the frosted style.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Close menus on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape closes; clicking outside closes.
  useEffect(() => {
    if (!menu && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (menu && headerRef.current && !headerRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu, mobileOpen]);

  const openWithHover = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };

  const cta = role ? { href: dashFor[role], label: "My dashboard" } : { href: "/services", label: "Book a service" };
  const linkCls = (active: boolean) =>
    cn("link-underline pb-0.5 text-[14px] font-medium transition-colors", active ? "text-ink [background-size:100%_1px]" : "text-ink/70 hover:text-ink");

  const triggerProps = { menu, setMenu, openWithHover, scheduleClose };

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        <Announcement />
        <div
          className={cn(
            "relative border-b transition-[background-color,border-color,box-shadow] duration-500",
            scrolled || menu ? "border-ink/10 bg-cream/90 shadow-[0_12px_32px_-24px_rgba(40,43,74,0.45)] backdrop-blur-xl" : "border-transparent bg-cream",
            mobileOpen && "border-transparent bg-transparent shadow-none backdrop-blur-none",
          )}
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
            <div className={cn("relative z-10 transition-opacity", mobileOpen && "opacity-0")}>
              <Logo />
            </div>

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              <MenuTrigger k="services" label={primaryNav.services.label} {...triggerProps} />
              <Link href={primaryNav.howItWorks.href} className={linkCls(false)}>
                {primaryNav.howItWorks.label}
              </Link>
              <Link href={primaryNav.pros.href} className={linkCls(pathname === primaryNav.pros.href)}>
                {primaryNav.pros.label}
              </Link>
              <div className="relative">
                <MenuTrigger k="company" label={primaryNav.company.label} {...triggerProps} />
                <AnimatePresence>
                  {menu === "company" && (
                    <motion.div
                      id="menu-company"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onPointerEnter={(e) => e.pointerType === "mouse" && openWithHover("company")}
                      onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
                      className="absolute left-1/2 top-full w-90 -translate-x-1/2 pt-5"
                    >
                      <div className="rounded-3xl border border-ink/10 bg-paper p-3 shadow-[0_40px_80px_-40px_rgba(40,43,74,0.55)]">
                        <CompanyPanel onNavigate={() => setMenu(null)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-2">
              {!role && (
                <Link href="/login" className="link-underline hidden pb-0.5 text-[14px] font-medium text-ink/70 hover:text-ink lg:inline">
                  Log in
                </Link>
              )}
              <CartButton />
              <Magnetic strength={0.2} className="hidden sm:inline-block">
                <Link href={cta.href} className="group ml-3 inline-flex h-11 items-center gap-2 rounded-full bg-ink pl-5 pr-1.5 text-[14px] font-medium text-cream">
                  {cta.label}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </Magnetic>

              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className={cn("relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden", mobileOpen ? "bg-cream text-ink" : "bg-ink text-cream")}
              >
                <span className="relative block h-3 w-5">
                  <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500", mobileOpen ? "top-1.5 rotate-45" : "top-0")} />
                  <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500", mobileOpen ? "top-1.5 -rotate-45" : "top-3")} />
                </span>
              </button>
            </div>
          </div>

          {/* Scroll progress */}
          <motion.span
            aria-hidden
            style={{ scaleX: scrollYProgress }}
            className={cn("absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-ink transition-opacity duration-300", scrolled && !mobileOpen ? "opacity-100" : "opacity-0")}
          />

          {/* Desktop dropdown panels */}
          <AnimatePresence>
            {menu === "services" && (
              <motion.div
                id="menu-services"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                onPointerEnter={(e) => e.pointerType === "mouse" && openWithHover("services")}
                onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
                className="absolute inset-x-0 top-full hidden lg:block"
              >
                <div className="mx-auto max-w-7xl px-5 pt-2 sm:px-8">
                  <div className="rounded-[28px] border border-ink/10 bg-paper p-4 shadow-[0_40px_80px_-40px_rgba(40,43,74,0.55)]">
                    <ServicesPanel onNavigate={() => setMenu(null)} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: "circle(0% at calc(100% - 42px) 72px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 42px) 72px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 42px) 72px)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-6 pb-8 pt-32 text-cream lg:hidden"
          >
            <nav className="flex flex-1 flex-col" aria-label="Mobile">
              <MobileItem i={0} href="/" label="Home" onClick={() => setMobileOpen(false)} />
              <div className="overflow-hidden">
                <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
                  <button
                    type="button"
                    aria-expanded={servicesExpanded}
                    onClick={() => setServicesExpanded((v) => !v)}
                    className="flex w-full items-baseline gap-4 py-1.5 text-left text-[38px] font-bold leading-tight tracking-[-0.04em]"
                  >
                    <span className="text-xs font-medium tracking-normal text-cream/40">02</span>
                    Services
                    <Plus className={cn("ml-auto h-6 w-6 self-center transition-transform duration-300", servicesExpanded && "rotate-45")} />
                  </button>
                </motion.div>
              </div>
              <AnimatePresence initial={false}>
                {servicesExpanded && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden pl-9"
                  >
                    {serviceMenu.map((s) => (
                      <li key={s.slug}>
                        <Link href={s.href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between border-b border-cream/10 py-3 text-[16px] text-cream/80">
                          {s.label}
                          <span className="font-mono text-[10px] text-cream/40">from {formatINR(s.fromPaise)}</span>
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              {[
                { href: primaryNav.howItWorks.href, label: primaryNav.howItWorks.label },
                { href: primaryNav.pros.href, label: primaryNav.pros.label },
                ...companyMenu.filter((c) => c.href !== "/professionals").map((c) => ({ href: c.href, label: c.label.replace(" PipePilot", "") })),
              ].map((n, idx) => (
                <MobileItem key={n.href} i={idx + 2} href={n.href} label={n.label} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 grid grid-cols-2 gap-3">
              <Link href={role ? dashFor[role] : "/login"} onClick={() => setMobileOpen(false)} className="flex h-12 items-center justify-center rounded-full border border-cream/25 text-sm font-medium">
                {role ? "Dashboard" : "Log in"}
              </Link>
              <Link href="/services" onClick={() => setMobileOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-cream text-sm font-medium text-ink">
                Book now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuTrigger({
  k,
  label,
  menu,
  setMenu,
  openWithHover,
  scheduleClose,
}: {
  k: MenuKey;
  label: string;
  menu: MenuKey | null;
  setMenu: (m: MenuKey | null) => void;
  openWithHover: (m: MenuKey) => void;
  scheduleClose: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={menu === k}
      aria-controls={`menu-${k}`}
      onClick={() => setMenu(menu === k ? null : k)}
      onPointerEnter={(e) => e.pointerType === "mouse" && openWithHover(k)}
      onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
      className={cn("flex items-center gap-1 py-2 text-[14px] font-medium transition-colors", menu === k ? "text-ink" : "text-ink/70 hover:text-ink")}
    >
      {label}
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", menu === k && "rotate-180")} />
    </button>
  );
}

function MobileItem({ i, href, label, onClick }: { i: number; href: string; label: string; onClick: () => void }) {
  return (
    <div className="overflow-hidden">
      <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.05 }}>
        <Link href={href} onClick={onClick} className="flex items-baseline gap-4 py-1.5 text-[38px] font-bold leading-tight tracking-[-0.04em]">
          <span className="text-xs font-medium tracking-normal text-cream/40">{String(i + 1).padStart(2, "0")}</span>
          {label}
        </Link>
      </motion.div>
    </div>
  );
}
