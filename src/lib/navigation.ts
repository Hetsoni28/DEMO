import { categories, services } from "./mock-data";
import { legalPages } from "./legal";

export type NavLink = { label: string; href: string; description?: string };

export const serviceMenu = categories.map((c) => {
  const list = services.filter((s) => s.categorySlug === c.slug);
  return {
    slug: c.slug,
    label: c.name,
    description: c.blurb,
    icon: c.icon,
    count: list.length,
    fromPaise: Math.min(...list.map((s) => s.pricePaise)),
    href: `/services?category=${c.slug}`,
  };
});

export const companyMenu: NavLink[] = [
  { label: "About PipePilot", href: "/about", description: "Why we built a better way to book home services" },
  { label: "For professionals", href: "/professionals", description: "Pre-paid jobs on your own schedule" },
  { label: "Contact", href: "/contact", description: "Bookings, refunds and partnerships" },
];

export const primaryNav = {
  services: { label: "Services", href: "/services" },
  howItWorks: { label: "How it works", href: "/#how-it-works" },
  pros: { label: "For professionals", href: "/professionals" },
  company: { label: "Company" },
};

export const footerColumns: { title: string; links: NavLink[] }[] = [
  { title: "Services", links: serviceMenu.map((s) => ({ label: s.label, href: s.href })) },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Join as a professional", href: "/professionals" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Book a service", href: "/services" },
      { label: "My bookings", href: "/customer/bookings" },
      { label: "Home passport", href: "/customer/home-passport" },
      { label: "Log in", href: "/login" },
    ],
  },
  { title: "Legal", links: legalPages.map((l) => ({ label: l.title, href: `/legal/${l.slug}` })) },
];
