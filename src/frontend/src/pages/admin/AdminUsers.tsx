import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Search, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminActivateUser, useAdminUserList } from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

export function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUserList();
  const activateUser = useAdminActivateUser();
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search),
  );

  const planNames: Record<string, string> = {
    "1": "Starter",
    "2": "Growth",
    "3": "Premium",
  };

  const handleToggle = async (userId: string, current: boolean) => {
    try {
      await activateUser.mutateAsync({ userId, isActive: !current });
      toast.success(`User ${!current ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            All Users
          </h1>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {users.length}
          </Badge>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="admin.users.search_input"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border text-foreground"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="admin.users.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No users found
        </div>
      ) : (
        <div data-ocid="admin.users_table" className="space-y-2">
          {filtered.map((u, i) => (
            <div
              key={u.id}
              data-ocid={`admin.users.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{u.fullName}</p>
                  <Badge
                    className={`text-xs ${
                      planNames[u.planId?.toString()] === "Premium"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : planNames[u.planId?.toString()] === "Growth"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {planNames[u.planId?.toString()] || "Unknown"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{u.mobile}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>Wallet: {formatCurrency(u.walletBalance)}</span>
                  <span>Income: {formatCurrency(u.totalIncome)}</span>
                  <span>
                    Team: L{u.leftTeamCount?.toString()} / R
                    {u.rightTeamCount?.toString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  data-ocid={`admin.user.activate_button.${i + 1}`}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 rounded-lg border-green-500/40 text-green-400 hover:bg-green-500/10"
                  onClick={() => handleToggle(u.id, false)}
                  disabled={activateUser.isPending}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activate
                </Button>
                <Button
                  data-ocid={`admin.user.deactivate_button.${i + 1}`}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 rounded-lg border-red-500/40 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleToggle(u.id, true)}
                  disabled={activateUser.isPending}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Deactivate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
