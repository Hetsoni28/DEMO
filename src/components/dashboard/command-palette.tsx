"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Globe, LogOut, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { EASE } from "@/components/motion/motion";
import { services } from "@/lib/mock-data";
import { useApp, type Role } from "@/lib/store";
import type { NavItem } from "@/components/organisms/dashboard-shell";

/** ⌘K / Ctrl+K command palette: jump to pages, book services, run demo actions. */
export function CommandPalette({ open, onOpenChange, nav, role }: { open: boolean; onOpenChange: (v: boolean) => void; nav: NavItem[]; role: Role }) {
  const router = useRouter();
  const reset = useApp((s) => s.reset);
  const setRole = useApp((s) => s.setRole);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const itemCls =
    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink/80 data-[selected=true]:bg-ink data-[selected=true]:text-cream [&_svg]:h-4 [&_svg]:w-4";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-[24px] border border-ink/10 bg-paper shadow-[0_40px_100px_-30px_rgba(40,43,74,0.6)]"
          >
            <Command label="Command palette" loop>
              <div className="flex items-center gap-3 border-b border-ink/10 px-5">
                <Search className="h-4 w-4 text-ink/40" />
                <Command.Input autoFocus placeholder="Search pages, services or actions…" className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/40" />
                <kbd className="rounded-md border border-ink/15 px-1.5 py-0.5 font-mono text-[10px] text-ink/50">ESC</kbd>
              </div>
              <Command.List className="max-h-[50vh] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-[13.5px] text-ink/50">Nothing matches that.</Command.Empty>

                <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-ink/45">
                  {nav.map((n) => (
                    <Command.Item key={n.href} value={`go ${n.label}`} onSelect={() => run(() => router.push(n.href))} className={itemCls}>
                      <n.icon />
                      {n.label}
                      <ArrowRight className="ml-auto opacity-40" />
                    </Command.Item>
                  ))}
                </Command.Group>

                {role === "customer" && (
                  <Command.Group heading="Book a service" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-ink/45">
                    {services.map((s) => (
                      <Command.Item key={s.slug} value={`book ${s.title} ${s.categorySlug}`} onSelect={() => run(() => router.push(`/book/${s.slug}`))} className={itemCls}>
                        <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-50" />
                        {s.title}
                        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.1em] opacity-50">{s.categorySlug.replace("-", " ")}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-ink/45">
                  <Command.Item value="website home" onSelect={() => run(() => router.push("/"))} className={itemCls}>
                    <Globe /> Open the website
                  </Command.Item>
                  <Command.Item
                    value="reset demo data"
                    onSelect={() =>
                      run(() => {
                        reset();
                        toast.success("Demo data reset");
                      })
                    }
                    className={itemCls}
                  >
                    <RotateCcw /> Reset demo data
                  </Command.Item>
                  <Command.Item
                    value="switch role log out"
                    onSelect={() =>
                      run(() => {
                        setRole(null);
                        router.push("/login");
                      })
                    }
                    className={itemCls}
                  >
                    <LogOut /> Switch role / log out
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="flex items-center justify-between border-t border-ink/10 px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/45">
                <span>PipePilot · {role}</span>
                <span className="flex items-center gap-1.5">
                  <CornerDownLeft className="h-3 w-3" /> to select
                </span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
