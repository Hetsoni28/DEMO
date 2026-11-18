import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/atoms/logo";
import { AuthAside } from "@/components/auth/auth-aside";
import { MotionProvider } from "@/components/motion/motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="grid grid-cols-1 min-h-svh lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_1fr]">
        <div className="grain flex min-h-svh flex-col px-5 py-6 sm:px-10">
          <header className="flex items-center justify-between">
            <Logo />
            <Link href="/" className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/60 transition-colors hover:text-ink">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back to site
            </Link>
          </header>

          <main className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-[440px]">{children}</div>
          </main>

          <footer className="flex flex-col gap-2 text-[12px] text-ink/45 sm:flex-row sm:items-center sm:justify-between">
            <span>
              By continuing you agree to our{" "}
              <Link href="/legal/terms" className="link-underline pb-0.5 text-ink/70 hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="link-underline pb-0.5 text-ink/70 hover:text-ink">
                Privacy Policy
              </Link>
              .
            </span>
            <span className="font-mono uppercase tracking-[0.12em]">Demo build</span>
          </footer>
        </div>
        <AuthAside />
      </div>
    </MotionProvider>
  );
}
