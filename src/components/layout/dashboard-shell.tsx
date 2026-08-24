"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { toast } from "sonner";
import { AdminMenu } from "@/components/layout/admin-menu";
import {
  NAV_ITEMS,
  getRouteMeta,
  isActiveNav,
} from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COLLAPSED_STORAGE_KEY = "nutripak.sidebar.collapsed";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2.5 rounded-md px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      aria-label={`${APP_NAME} dashboard home`}
    >
      <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Leaf className="size-4" aria-hidden />
      </span>
      {!compact ? (
        <span className="truncate text-base font-bold tracking-tight">
          Nutri<span className="text-primary">pak</span>
          <span className="text-muted-foreground ml-1.5 text-xs font-medium tracking-wide uppercase">
            Admin
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavLinks({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Dashboard" className="grid gap-0.5 px-2">
      {NAV_ITEMS.map((item) => {
        const active = isActiveNav(pathname, item);
        const Icon = item.icon;

        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
            {!collapsed ? (
              <span
                aria-hidden
                className={cn(
                  "ml-auto h-4 w-1 rounded-full",
                  active ? "bg-primary" : "bg-transparent"
                )}
              />
            ) : null}
          </Link>
        );

        if (!collapsed) return <div key={item.href}>{link}</div>;

        // Icon-only mode keeps labels discoverable through tooltips.
        return (
          <TooltipProvider key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </nav>
  );
}

function useLogout() {
  const router = useRouter();
  return useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  }, [router]);
}

interface DashboardShellProps {
  user: { name: string; email: string };
  children: ReactNode;
}

const sidebarListeners = new Set<() => void>();

function subscribeToSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  return () => {
    sidebarListeners.delete(callback);
  };
}

function getSidebarSnapshot(): string {
  return localStorage.getItem(COLLAPSED_STORAGE_KEY) ?? "0";
}

function getServerSidebarSnapshot(): string {
  return "0";
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const { title, breadcrumbs } = getRouteMeta(pathname);

  // Persisted via localStorage; useSyncExternalStore keeps this hydration-safe
  // without setState-in-effect (server renders the expanded default).
  const storedValue = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );
  const collapsed = storedValue === "1";
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    const next = collapsed ? "0" : "1";
    localStorage.setItem(COLLAPSED_STORAGE_KEY, next);
    sidebarListeners.forEach((listener) => listener());
  }

  return (
    <div className="flex min-h-svh w-full">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside
        data-collapsed={collapsed}
        className={cn(
          "bg-sidebar border-sidebar-border sticky top-0 hidden h-svh shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out md:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed && "justify-center px-2"
          )}
        >
          <Brand compact={collapsed} />
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks pathname={pathname} collapsed={collapsed} />
        </div>

        <div className="border-sidebar-border space-y-1 border-t p-2">
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Log out"
            title="Log out"
            className={cn(
              "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground text-sidebar-foreground/75 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="size-4.5 shrink-0" aria-hidden />
            {!collapsed ? "Log out" : null}
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="size-4.5" aria-hidden />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
          {/* Mobile navigation trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar w-72 p-0">
              <SheetHeader className="border-sidebar-border border-b px-4 py-3">
                <SheetTitle asChild>
                  <div>
                    <Brand />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="py-3">
                <NavLinks
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
              <div className="border-sidebar-border border-t p-2">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium"
                >
                  <LogOut className="size-4.5" aria-hidden /> Log out
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Title + breadcrumb */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
              {title}
            </h1>
            <nav aria-label="Breadcrumb" className="hidden sm:block">
              <ol className="text-muted-foreground flex items-center gap-1.5 text-xs">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                      {index > 0 ? (
                        <span aria-hidden>/</span>
                      ) : null}
                      {isLast ? (
                        <span aria-current="page">{crumb.label}</span>
                      ) : crumb.href === "#" ? (
                        <span>{crumb.label}</span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="hover:text-foreground underline-offset-2 hover:underline"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AdminMenu name={user.name} email={user.email} />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 md:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
