/**
 * Role-based access control for the demo.
 *
 * Every person signs in to an Account with exactly one role. A role decides which
 * portal they may open and what they may do there (see PERMISSIONS). Professionals
 * start as PENDING applicants and can only open the professional portal once an
 * admin approves them. Admins can change roles and pause access from Team & access.
 */
import type { Professional } from "./mock-data";
import { DEMO_CUSTOMER } from "./mock-data";

export type Role = "customer" | "professional" | "admin";

export type AccountStatus = "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED";

export type Account = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
  /** Linked professional profile (role === "professional"). */
  proId?: string;
  createdAt: string;
  /** Set when an admin approves or rejects an application. */
  reviewedAt?: string;
  reviewNote?: string;
  /** False until the professional has seen their "you're approved" message. */
  approvalSeen?: boolean;
};

export const ROLE_LABEL: Record<Role, string> = { customer: "Customer", professional: "Professional", admin: "Admin" };
export const PORTAL_LABEL: Record<Role, string> = { customer: "customer app", professional: "professional app", admin: "operations console" };
export const PORTAL_HOME: Record<Role, string> = { customer: "/customer/dashboard", professional: "/professional/dashboard", admin: "/admin/dashboard" };

export const STATUS_LABEL: Record<AccountStatus, string> = { ACTIVE: "Active", PENDING: "Awaiting approval", REJECTED: "Not approved", SUSPENDED: "Access paused" };

/** What each role may do. The UI uses `can()`; a real backend would enforce the same table. */
export const PERMISSIONS = [
  { key: "booking.create", label: "Book and pay for services", roles: ["customer"] },
  { key: "booking.own", label: "See own bookings, QR and invoices", roles: ["customer"] },
  { key: "job.assigned", label: "See jobs assigned to them", roles: ["professional"] },
  { key: "job.start", label: "Scan a customer QR to start a job", roles: ["professional"] },
  { key: "availability.manage", label: "Set working hours and days off", roles: ["professional"] },
  { key: "booking.all", label: "See every booking and payment", roles: ["admin"] },
  { key: "booking.assign", label: "Assign professionals to bookings", roles: ["admin"] },
  { key: "pro.review", label: "Approve or reject professional applications", roles: ["admin"] },
  { key: "refund.issue", label: "Issue refunds", roles: ["admin"] },
  { key: "role.assign", label: "Change roles and pause access", roles: ["admin"] },
] as const satisfies readonly { key: string; label: string; roles: readonly Role[] }[];

export type Permission = (typeof PERMISSIONS)[number]["key"];

export function can(account: Pick<Account, "role" | "status"> | null | undefined, permission: Permission) {
  if (!account || account.status !== "ACTIVE") return false;
  const p = PERMISSIONS.find((x) => x.key === permission);
  return !!p && (p.roles as readonly Role[]).includes(account.role);
}

const slugify = (name: string) => name.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "");

/** Demo accounts: one per seeded person, so the Team & access page reflects the whole marketplace. */
export function seedAccounts(pros: Professional[], nowISO: string): Account[] {
  const daysAgo = (d: number) => new Date(new Date(nowISO).getTime() - d * 86_400_000).toISOString();
  return [
    { id: DEMO_CUSTOMER.id, name: DEMO_CUSTOMER.name, email: DEMO_CUSTOMER.email, phone: "9876543210", role: "customer", status: "ACTIVE", createdAt: daysAgo(120) },
    { id: "c2", name: "Priya Shah", email: "priya@example.com", phone: "9876500002", role: "customer", status: "ACTIVE", createdAt: daysAgo(64) },
    { id: "c3", name: "Rohit Jain", email: "rohit@example.com", phone: "9876500003", role: "customer", status: "ACTIVE", createdAt: daysAgo(41) },
    ...pros.map<Account>((p, i) => ({
      id: `a_${p.id}`,
      name: p.name,
      email: `${slugify(p.name)}@homecrew.example`,
      phone: p.id === "p1" ? "9876543211" : p.id === "p4" ? "9876543213" : `98765100${String(i).padStart(2, "0")}`,
      role: "professional",
      status: p.verification === "VERIFIED" ? "ACTIVE" : p.verification === "REJECTED" ? "REJECTED" : "PENDING",
      proId: p.id,
      createdAt: daysAgo(p.verification === "PENDING" ? 2 + i : 90 + i * 7),
      approvalSeen: true,
    })),
    { id: "a_admin", name: "Ops Admin", email: "ops@homecrew.example", phone: "9876543212", role: "admin", status: "ACTIVE", createdAt: daysAgo(180) },
  ];
}

/** Rough years from the registration form's experience band. */
export function yearsFromBand(band: string) {
  if (band.startsWith("Under")) return 1;
  if (band.startsWith("3")) return 4;
  if (band.startsWith("6")) return 8;
  return 12;
}
