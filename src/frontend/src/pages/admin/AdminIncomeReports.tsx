import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { Variant_level_direct_binary } from "../../backend.d";
import {
  useAdminIncomeReports,
  useAdminUserList,
} from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

export function AdminIncomeReportsPage() {
  const { data: users = [], isLoading: usersLoading } = useAdminUserList();
  const { data: incomeRecords = [], isLoading: reportsLoading } =
    useAdminIncomeReports();

  const isLoading = usersLoading || reportsLoading;

  const totalDirectIncome = incomeRecords
    .filter((r) => r.incomeType === Variant_level_direct_binary.direct)
    .reduce((sum, r) => sum + r.amount, 0n);

  const totalBinaryIncome = incomeRecords
    .filter((r) => r.incomeType === Variant_level_direct_binary.binary)
    .reduce((sum, r) => sum + r.amount, 0n);

  const totalLevelIncome = incomeRecords
    .filter((r) => r.incomeType === Variant_level_direct_binary.level)
    .reduce((sum, r) => sum + r.amount, 0n);

  const totalIncome = users.reduce((sum, u) => sum + (u.totalIncome || 0n), 0n);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Income Reports
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-4 card-glow col-span-2">
          <p className="text-xs text-muted-foreground mb-1">
            Total Income Distributed
          </p>
          <p className="font-display text-2xl font-bold text-primary">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-card border border-green-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-muted-foreground mb-1">Direct Income</p>
          <p className="font-display text-xl font-bold text-green-400">
            {formatCurrency(totalDirectIncome)}
          </p>
        </div>
        <div className="bg-card border border-blue-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-muted-foreground mb-1">Binary Income</p>
          <p className="font-display text-xl font-bold text-blue-400">
            {formatCurrency(totalBinaryIncome)}
          </p>
        </div>
        <div className="bg-card border border-purple-500/20 rounded-xl p-4 card-glow col-span-2">
          <p className="text-xs text-muted-foreground mb-1">Level Income</p>
          <p className="font-display text-xl font-bold text-purple-400">
            {formatCurrency(totalLevelIncome)}
          </p>
        </div>
      </div>

      {/* Per-user breakdown */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">
                    Name
                  </th>
                  <th className="text-right py-2 text-xs text-green-400 font-medium">
                    Direct
                  </th>
                  <th className="text-right py-2 text-xs text-blue-400 font-medium">
                    Binary
                  </th>
                  <th className="text-right py-2 text-xs text-purple-400 font-medium">
                    Level
                  </th>
                  <th className="text-right py-2 text-xs text-primary font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    data-ocid={`admin.income.item.${i + 1}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2.5">
                      <p className="text-sm font-medium text-foreground">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.mobile}
                      </p>
                    </td>
                    <td className="text-right py-2.5 text-green-400 font-semibold text-xs">
                      {formatCurrency(u.directIncome || 0n)}
                    </td>
                    <td className="text-right py-2.5 text-blue-400 font-semibold text-xs">
                      {formatCurrency(u.binaryIncome || 0n)}
                    </td>
                    <td className="text-right py-2.5 text-purple-400 font-semibold text-xs">
                      {formatCurrency(u.levelIncome || 0n)}
                    </td>
                    <td className="text-right py-2.5 text-primary font-bold text-xs">
                      {formatCurrency(u.totalIncome || 0n)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
