"use client";

import { forwardRef, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { EASE } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

const inputBase =
  "h-[52px] w-full rounded-2xl border bg-paper px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink/35 focus:border-ink focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)] disabled:opacity-60";

export function Field({ label, error, hint, htmlFor, aside, children }: { label: string; error?: string; hint?: ReactNode; htmlFor?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="err"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-[#B42318]"
          >
            <CircleAlert className="h-3.5 w-3.5 shrink-0" /> {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-[12.5px] text-ink/50">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(function TextInput({ className, invalid, ...props }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputBase, invalid ? "border-[#B42318]/60" : "border-ink/15", className)} {...props} />;
});

export const PhoneInput = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(function PhoneInput({ className, invalid, ...props }, ref) {
  return (
    <div
      className={cn(
        "flex h-[52px] items-center overflow-hidden rounded-2xl border bg-paper transition-[border-color,box-shadow] duration-200 focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]",
        invalid ? "border-[#B42318]/60" : "border-ink/15",
      )}
    >
      <span className="flex h-full items-center gap-2 border-r border-ink/10 px-4 text-[15px] font-medium text-ink">
        <span aria-hidden className="text-base leading-none">🇮🇳</span>+91
      </span>
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        aria-invalid={invalid || undefined}
        className={cn("h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] tracking-[0.04em] text-ink outline-none placeholder:tracking-normal placeholder:text-ink/35", className)}
        {...props}
      />
    </div>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(function PasswordInput({ className, invalid, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={show ? "text" : "password"} aria-invalid={invalid || undefined} className={cn(inputBase, "pr-12", invalid ? "border-[#B42318]/60" : "border-ink/15", className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

/** Six-box one-time-code input: auto-advance, backspace to previous, paste to fill. */
export function OtpInput({ value, onChange, invalid, autoFocus }: { value: string; onChange: (v: string) => void; invalid?: boolean; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const id = useId();
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const setAt = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, 6));
  };

  return (
    <div className="flex gap-2 sm:gap-2.5" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`${id}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          value={d}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return setAt(i, "");
            if (v.length > 1) {
              // Autofill / paste of several digits into one box
              const merged = (digits.slice(0, i).join("") + v).slice(0, 6);
              onChange(merged);
              refs.current[Math.min(merged.length, 5)]?.focus();
              return;
            }
            setAt(i, v);
            refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              e.preventDefault();
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!v) return;
            e.preventDefault();
            onChange(v);
            refs.current[Math.min(v.length, 5)]?.focus();
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-2xl border bg-paper text-center font-mono text-[22px] font-semibold text-ink outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-ink focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]",
            invalid ? "border-[#B42318]/60" : d ? "border-ink/40" : "border-ink/15",
          )}
        />
      ))}
    </div>
  );
}

/** Animated segmented control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  label,
}: {
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid rounded-2xl border border-ink/10 bg-ink/[0.04] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn("relative flex h-10 items-center justify-center gap-2 rounded-xl text-[13.5px] font-medium transition-colors", on ? "text-cream" : "text-ink/60 hover:text-ink")}
          >
            {on && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-ink" transition={{ duration: 0.45, ease: EASE }} />}
            <span className="relative flex items-center gap-2">
              {o.icon && <o.icon className="h-4 w-4" />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SubmitButton({ loading, children, className, ...props }: ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={cn(
        "group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-ink text-[15px] font-semibold text-cream transition-[transform,opacity] duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span key="l" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
            Please wait…
          </motion.span>
        ) : (
          <motion.span key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-dashed border-ink/20 px-4 py-3 text-[12.5px] leading-relaxed text-ink/60">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-ink/50" />
      <span>{children}</span>
    </div>
  );
}
