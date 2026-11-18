import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = pageMetadata({ title: "Create account", description: "Create a HomeCrew account to book verified home-service professionals — or join as one.", path: "/register", noIndex: true });

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
