import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { useAdminUserList } from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

export function AdminIncomeReportsPage() {
  const { data: users = [], isLoading } = useAdminUserList();

  const totalIncome = users.reduce((sum, u) => sum + (u.totalIncome || 0n), 0n);
  const totalWallet = users.reduce(
    (sum, u) => sum + (u.walletBalance || 0n),
    0n,
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Income Reports
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 card-glow">
          <p className="text-xs text-muted-foreground mb-1">
            Total Income Distributed
          </p>
          <p className="font-display text-xl font-bold text-primary">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 card-glow">
          <p className="text-xs text-muted-foreground mb-1">
            Total Wallet Balance
          </p>
          <p className="font-display text-xl font-bold text-amber-400">
            {formatCurrency(totalWallet)}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 card-glow">
        <p className="text-sm font-semibold text-foreground mb-4">
          User Income Breakdown
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p
            data-ocid="admin.income.empty_state"
            className="text-center text-muted-foreground text-sm py-8"
          >
            No income data yet
          </p>
        ) : (
          <div className="space-y-0">
            {users.map((u, i) => (
              <div
                key={u.id}
                data-ocid={`admin.income.item.${i + 1}`}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {u.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(u.totalIncome || 0n)}
                  </p>
                  <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Wallet: {formatCurrency(u.walletBalance)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
