"use client";

import { useEffect } from "react";
import { hydrateStore, useApp } from "@/lib/store";
// Registers the install-prompt listener as early as possible on every page.
import "@/lib/install";

/**
 * Loads the demo data once, and keeps tabs in sync: when an admin approves an
 * application in one tab, the applicant's tab picks it up straight away.
 */
export function StoreHydrator() {
  useEffect(() => {
    void hydrateStore();
    const key = useApp.persist.getOptions().name;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) void useApp.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
