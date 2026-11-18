import { CartDrawer } from "@/components/cart/cart";
import { SmoothScroll } from "@/components/motion/motion";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <SiteHeader />
      <main className="flex-1 pt-27">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </SmoothScroll>
  );
}
