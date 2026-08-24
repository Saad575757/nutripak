import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings, exact: true },
];

const SINGULAR_LABELS: Record<string, string> = {
  Products: "Product",
  Categories: "Category",
  Inventory: "Inventory",
  Orders: "Order",
  Customers: "Customer",
  Settings: "Setting",
};

interface RouteMeta {
  title: string;
  breadcrumbs: { label: string; href: string }[];
}

/** Derives the header title/breadcrumb from the current pathname. */
export function getRouteMeta(pathname: string): RouteMeta {
  const segments = pathname.split("/").filter(Boolean);
  const sectionPath = segments.length > 1 ? `/${segments.slice(0, 2).join("/")}` : "/admin";
  const section = NAV_ITEMS.find((item) => item.href === sectionPath);
  const sectionLabel = section?.label ?? "Dashboard";

  const breadcrumbs: RouteMeta["breadcrumbs"] = [{ label: "Home", href: "/admin" }];
  if (sectionPath !== "/admin") {
    breadcrumbs.push({ label: sectionLabel, href: sectionPath });
  }

  const rest = segments.slice(2);
  let title = sectionLabel;

  if (rest.length > 0) {
    const last = rest[rest.length - 1];
    const singular = SINGULAR_LABELS[sectionLabel] ?? sectionLabel;
    if (last === "new") {
      title = `New ${singular}`;
      breadcrumbs.push({ label: title, href: "#" });
    } else if (last === "edit") {
      title = `Edit ${singular}`;
      breadcrumbs.push({ label: title, href: "#" });
    } else if (rest.length === 1 || last !== "edit") {
      // Detail pages such as /orders/np-1001
      title =
        singular === "Order" ? "Order details" : `${singular} details`;
      breadcrumbs.push({ label: title, href: "#" });
    }
  }

  return { title, breadcrumbs };
}

export function isActiveNav(
  pathname: string,
  item: NavItem
): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
