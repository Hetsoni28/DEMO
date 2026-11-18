import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = pageMetadata({ title: "Log in", description: "Log in to HomeCrew to manage bookings, track visits and see invoices.", path: "/login", noIndex: true });

export default function LoginPage() {
  return <LoginForm />;
}
