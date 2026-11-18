import type { Metadata } from "next";
import { Logo } from "@/components/atoms/logo";
import { CheckoutFlow } from "./checkout-flow";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <span className="text-sm text-slate-500">Secure checkout · one payment</span>
        </div>
      </header>
      <CheckoutFlow />
    </div>
  );
}
