"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { EASE } from "@/components/motion/motion";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * "Get the app" for the Customer (HomeCrew) and Professional (HomeCrew Pro) apps:
 * a real, scannable QR to open the app on a phone, plus one-tap install where the
 * browser supports it — like the app banners on Blinkit / Zepto web.
 */
export function GetAppButton({ app }: { app: "customer" | "professional" }) {
  const name = app === "customer" ? "HomeCrew" : "HomeCrew Pro";
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!open || qr) return;
    QRCode.toDataURL(`${window.location.origin}/${app}/dashboard`, { margin: 1, width: 300, color: { dark: "#282B4A", light: "#FFFFFF" } }).then(setQr, () => setQr(null));
  }, [open, qr, app]);

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
        className="flex h-10 items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 text-[13px] font-semibold text-ink transition-colors hover:border-ink/25"
      >
        <Smartphone className="h-4 w-4" /> Get the app
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(40,43,74,0.45)]"
          >
            <div className="text-[15px] font-bold text-ink">Get {name} on your phone</div>
            <p className="mt-1 text-[12.5px] text-ink/60">Scan with your phone camera, then tap “Add to Home Screen”.</p>
            <div className="mx-auto mt-3 flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border border-ink/8 bg-white">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL generated on the client
                <img src={qr} alt={`QR code to open ${name} on your phone`} className="h-full w-full" />
              ) : (
                <Smartphone className="h-8 w-8 text-ink/25" />
              )}
            </div>
            {installed ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-emerald-700">
                <Check className="h-4 w-4" /> Installed on this device
              </p>
            ) : installEvt ? (
              <button
                type="button"
                onClick={async () => {
                  await installEvt.prompt();
                  if ((await installEvt.userChoice).outcome === "accepted") setInstalled(true);
                  setInstallEvt(null);
                }}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-semibold text-cream"
              >
                <Download className="h-4 w-4" /> Install {name} here
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
