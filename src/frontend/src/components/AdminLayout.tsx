import { Button } from "@/components/ui/button";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { clearAdminToken, getAdminToken } from "../utils/format";

const adminNav = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  {
    to: "/admin/payments",
    icon: CreditCard,
    label: "Payments Verification",
  },
  { to: "/admin/products", icon: ShoppingBag, label: "Products Management" },
  { to: "/admin/plans", icon: Package, label: "Plans Management" },
  { to: "/admin/income", icon: TrendingUp, label: "Income Reports" },
  { to: "/admin/withdraw", icon: Wallet, label: "Withdraw Requests" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const state = useRouterState();
  const pathname = state.location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  if (!getAdminToken()) {
    navigate({ to: "/admin/login" });
    return null;
  }

  const handleLogout = () => {
    clearAdminToken();
    navigate({ to: "/admin/login" });
  };

  const isActive = (to: string) => {
    if (to === "/admin/payments") {
      return (
        pathname === "/admin/payments" || pathname === "/admin/registrations"
      );
    }
    if (to === "/admin/withdraw") {
      return (
        pathname === "/admin/withdraw" || pathname === "/admin/withdrawals"
      );
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          <img
            src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
            alt="Guccora"
            className="h-8 object-contain"
          />
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <button
              key={to}
              type="button"
              data-ocid={`admin.nav.${label.toLowerCase().replace(/\s+/g, "_")}.button`}
              onClick={() => navigate({ to })}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                isActive(to)
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            data-ocid="admin.logout.button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-border bg-sidebar/95 backdrop-blur-md">
        <img
          src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
          alt="Guccora"
          className="h-7 object-contain"
        />
        <button
          type="button"
          className="text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          data-ocid="admin.menu.toggle"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-14">
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <nav className="p-4 space-y-2">
            {adminNav.map(({ to, icon: Icon, label }) => (
              <button
                key={to}
                type="button"
                onClick={() => {
                  navigate({ to });
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent w-full text-left"
              >
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
