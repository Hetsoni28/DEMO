"use client";

import { useSyncExternalStore } from "react";

/**
 * App install support (PWA). Chrome/Edge/Android fire `beforeinstallprompt` once,
 * early in the page's life, so it is captured here at module level and shared
 * with every "Install" button. iPhone has no install prompt — callers show the
 * Share → Add to Home Screen steps instead.
 */
type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: PromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as PromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export type Platform = "ios" | "android" | "desktop";

function platform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

type Snapshot = { ready: boolean; canPrompt: boolean; installed: boolean; platform: Platform };
const SERVER: Snapshot = { ready: false, canPrompt: false, installed: false, platform: "desktop" };
let cache: Snapshot = SERVER;

function snapshot(): Snapshot {
  const next: Snapshot = { ready: true, canPrompt: !!deferred, installed: installed || standalone(), platform: platform() };
  if (next.canPrompt !== cache.canPrompt || next.installed !== cache.installed || next.platform !== cache.platform || !cache.ready) cache = next;
  return cache;
}

/** Install state for the current page, plus `prompt()` where the browser allows it. */
export function useInstall() {
  const s = useSyncExternalStore(subscribe, snapshot, () => SERVER);
  const prompt = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === "accepted") installed = true;
    emit();
    return outcome === "accepted";
  };
  return { ...s, prompt };
}
