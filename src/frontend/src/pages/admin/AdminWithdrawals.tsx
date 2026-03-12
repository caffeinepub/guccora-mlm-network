import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Variant_credit_debit,
  Variant_pending_approved_rejected,
} from "../../backend.d";
import {
  useAdminApproveWithdraw,
  useAdminUserList,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

export function AdminWithdrawalsPage() {
  const { data: users = [], isLoading } = useAdminUserList();
  const approveWithdraw = useAdminApproveWithdraw();

  // We show a summary of pending withdrawals per user
  const handleAction = async (txId: bigint, approved: boolean) => {
    try {
      await approveWithdraw.mutateAsync({ txId, approved });
      toast.success(`Withdrawal ${approved ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Withdrawals
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div
          data-ocid="admin.withdrawals.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No withdrawal requests
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4 card-glow">
            <p className="text-sm text-muted-foreground mb-4">
              User wallet summary. Use Approve/Reject to process withdrawal
              requests.
            </p>
            {users
              .filter((u) => Number(u.walletBalance) > 0)
              .map((u, i) => (
                <div
                  key={u.id}
                  data-ocid={`admin.withdrawals.item.${i + 1}`}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {u.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.mobile}</p>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      {formatCurrency(u.walletBalance)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`admin.withdrawals.approve_button.${i + 1}`}
                      size="sm"
                      className="gold-gradient text-primary-foreground text-xs h-8 rounded-lg"
                      onClick={() => handleAction(BigInt(i + 1), true)}
                      disabled={approveWithdraw.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button
                      data-ocid={`admin.withdrawals.reject_button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg"
                      onClick={() => handleAction(BigInt(i + 1), false)}
                      disabled={approveWithdraw.isPending}
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            {users.filter((u) => Number(u.walletBalance) > 0).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No pending withdrawal requests
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
