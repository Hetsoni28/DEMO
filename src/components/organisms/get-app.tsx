"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import QRCode from "qrcode";
import { EASE } from "@/components/motion/motion";
import { useInstall } from "@/lib/install";
import { cn } from "@/lib/utils";

export type AppId = "customer" | "professional";

export const APPS: Record<AppId, { name: string; who: string; path: string; icon: string; blurb: string }> = {
  customer: { name: "HomeCrew", who: "For customers", path: "/customer/dashboard", icon: "/apps/customer-192.png", blurb: "Book any home service, pay once, show your QR at the door." },
  professional: { name: "HomeCrew Pro", who: "For professionals", path: "/professional/dashboard", icon: "/apps/professional-192.png", blurb: "Your jobs, directions, QR check-in and earnings." },
};

/** Real, scannable QR code for a path on this site. */
function useQr(path: string, size = 300) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}${path}`, { margin: 1, width: size, color: { dark: "#282B4A", light: "#FFFFFF" } }).then(setSrc, () => setSrc(null));
  }, [path, size]);
  return src;
}

/** iPhone has no install prompt: show the two Safari steps. */
function IosSteps({ app, open, onClose }: { app: AppId; open: boolean; onClose: () => void }) {
  const a = APPS[app];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label={`Install ${a.name} on iPhone`}>
          <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-ink"
          >
            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-ink/15" aria-hidden />
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
              <img src={a.icon} alt="" className="h-12 w-12 rounded-xl" />
              <div>
                <div className="text-[17px] font-bold">Install {a.name}</div>
                <div className="text-[13px] text-ink/60">Two taps in Safari</div>
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              <li className="flex items-center gap-3 rounded-2xl bg-cream p-3 text-[14px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-cream">1</span>
                <span className="flex-1">
                  Tap <strong>Share</strong> in Safari’s toolbar
                </span>
                <Share className="h-5 w-5 text-[#0A84FF]" />
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-cream p-3 text-[14px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-cream">2</span>
                <span className="flex-1">
                  Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>
                </span>
                <PlusSquare className="h-5 w-5" />
              </li>
            </ol>
            <button type="button" onClick={onClose} className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-ink text-[15px] font-semibold text-cream">
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const DISMISS_DAYS = 7;
const dismissKey = (app: AppId) => `hc-install-dismissed-${app}`;
const noop = () => () => {};
function readDismissed(app: AppId) {
  try {
    const at = Number(localStorage.getItem(dismissKey(app)) || 0);
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/** Phones/tablets: "Install the app" card at the top of the app until installed or dismissed. */
export function InstallBanner({ app }: { app: AppId }) {
  const a = APPS[app];
  const { ready, installed, canPrompt, platform, prompt } = useInstall();
  const dismissedAtLoad = useSyncExternalStore(noop, () => readDismissed(app), () => true);
  const [hidden, setHidden] = useState(false);
  const [ios, setIos] = useState(false);
  const [help, setHelp] = useState(false);
  if (!ready || installed || dismissedAtLoad || hidden || platform === "desktop") return null;

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey(app), String(Date.now()));
    } catch {}
    setHidden(true);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mb-4 flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-3 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
        <img src={a.icon} alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-ink">Install the {a.name} app</div>
          <div className="truncate text-[12px] text-ink/55">Opens full-screen from your home screen</div>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (platform === "ios") return setIos(true);
            if (canPrompt) {
              if (await prompt()) setHidden(true);
              return;
            }
            setHelp(true);
          }}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-[13px] font-semibold text-cream transition-transform active:scale-95"
        >
          <Download className="h-4 w-4" /> Install
        </button>
        <button type="button" onClick={dismiss} aria-label="Not now" className="-mr-1 rounded-full p-1.5 text-ink/40 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
      {help && (
        <div className="-mt-2 mb-4 rounded-2xl bg-cream p-3 text-[13px] text-ink/70 lg:hidden">
          Open your browser menu <strong>⋮</strong> and tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
        </div>
      )}
      <IosSteps app={app} open={ios} onClose={() => setIos(false)} />
    </>
  );
}

/** Desktop app header: QR to open on a phone + install on this computer. */
export function GetAppButton({ app, compact = false }: { app: AppId; compact?: boolean }) {
  const a = APPS[app];
  const [open, setOpen] = useState(false);
  const { installed, canPrompt, prompt } = useInstall();
  const qr = useQr(a.path);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Get the ${a.name} app`}
        title="Get the app"
        className={cn("flex h-10 items-center gap-2 rounded-xl border border-ink/10 bg-white text-[13px] font-semibold text-ink transition-colors hover:border-ink/25", compact ? "w-10 justify-center" : "px-3")}
      >
        <Smartphone className="h-4 w-4" />
        {!compact && "Get the app"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-ink/10 bg-white p-4 text-ink shadow-[0_24px_60px_-24px_rgba(40,43,74,0.45)]"
          >
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
              <img src={a.icon} alt="" className="h-10 w-10 rounded-xl" />
              <div>
                <div className="text-[15px] font-bold">Get {a.name}</div>
                <div className="text-[12px] text-ink/55">{a.who}</div>
              </div>
            </div>
            <div className="mx-auto mt-3 flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border border-ink/8 bg-white">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL generated on the client
                <img src={qr} alt={`QR code to open ${a.name} on your phone`} className="h-full w-full" />
              ) : (
                <Smartphone className="h-8 w-8 text-ink/25" />
              )}
            </div>
            <p className="mt-2 text-center text-[12px] text-ink/55">Scan with your phone camera, then install.</p>
            {installed ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-emerald-700">
                <Check className="h-4 w-4" /> Installed on this device
              </p>
            ) : canPrompt ? (
              <button type="button" onClick={() => void prompt()} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-semibold text-cream">
                <Download className="h-4 w-4" /> Install on this computer
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Website: download section with both apps (QR + open). Anchor: #get-the-app */
export function AppDownloads() {
  return (
    <section id="get-the-app" aria-labelledby="get-the-app-title" className="scroll-mt-28">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/45">Get the apps</span>
          <h3 id="get-the-app-title" className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-tight">
            HomeCrew in your pocket.
          </h3>
        </div>
        <p className="max-w-sm text-[14px] text-cream/60">Install from your browser in a few seconds. No app store, no updates to download.</p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(APPS) as AppId[]).map((id) => (
          <AppDownloadCard key={id} app={id} />
        ))}
      </div>
    </section>
  );
}

function AppDownloadCard({ app }: { app: AppId }) {
  const a = APPS[app];
  const qr = useQr(a.path, 240);
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-cream/12 bg-cream/6 p-4">
      <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 sm:block">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL generated on the client
          <img src={qr} alt={`QR code to open ${a.name}`} className="h-full w-full" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
          <img src={a.icon} alt="" className="h-9 w-9 rounded-xl ring-1 ring-cream/15" />
          <div>
            <div className="text-[16px] font-bold">{a.name}</div>
            <div className="text-[12px] text-cream/55">{a.who}</div>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-cream/65">{a.blurb}</p>
        <Link href={a.path} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-cream px-4 text-[13px] font-semibold text-ink transition-transform active:scale-95">
          Open &amp; install <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
