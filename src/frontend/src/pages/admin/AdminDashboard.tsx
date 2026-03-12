import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  useAdminProducts,
  useAdminTotalBusiness,
  useAdminUserList,
} from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

export function AdminDashboardPage() {
  const { data: biz, isLoading } = useAdminTotalBusiness();
  const { data: users = [] } = useAdminUserList();
  const { data: products = [], isLoading: productsLoading } =
    useAdminProducts();
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Users",
      value: biz?.totalUsers?.toString() || "0",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Plans Sold",
      value: biz?.totalPlansSold?.toString() || "0",
      icon: CreditCard,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Income Distributed",
      value: formatCurrency(biz?.totalIncomeDistributed || 0n),
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Withdrawals",
      value: formatCurrency(biz?.totalWithdrawals || 0n),
      icon: Wallet,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) =>
          isLoading ? (
            <Skeleton key={label} className="h-24 rounded-xl" />
          ) : (
            <div
              key={label}
              data-ocid={`admin.stat.card.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4 card-glow"
            >
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ),
        )}
      </div>

      {/* Products List */}
      <div className="bg-card border border-border rounded-xl p-4 card-glow mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Products</p>
          </div>
          <Button
            data-ocid="admin.dashboard.products.link"
            variant="ghost"
            size="sm"
            className="text-primary h-7 text-xs px-2"
            onClick={() => navigate({ to: "/admin/products" })}
          >
            Manage
          </Button>
        </div>
        {productsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p
            data-ocid="admin.dashboard.products.empty_state"
            className="text-center text-muted-foreground text-sm py-4"
          >
            No products yet. Go to Products to add some.
          </p>
        ) : (
          <div className="space-y-2">
            {products.map((p, i) => (
              <div
                key={p.id?.toString()}
                data-ocid={`admin.dashboard.products.item.${i + 1}`}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {p.description}
                  </p>
                </div>
                <p className="text-sm text-primary font-bold flex-shrink-0">
                  {formatCurrency(p.price)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent users */}
      <div className="bg-card border border-border rounded-xl p-4 card-glow">
        <p className="text-sm font-semibold text-foreground mb-3">
          Recent Members
        </p>
        <div className="space-y-2">
          {users.slice(0, 5).map((u, i) => (
            <div
              key={u.id}
              data-ocid={`admin.recent.item.${i + 1}`}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {u.fullName}
                </p>
                <p className="text-xs text-muted-foreground">{u.mobile}</p>
              </div>
              <p className="text-sm text-primary font-semibold">
                {formatCurrency(u.walletBalance)}
              </p>
            </div>
          ))}
          {users.length === 0 && (
            <p
              data-ocid="admin.recent.empty_state"
              className="text-center text-muted-foreground text-sm py-4"
            >
              No users yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
