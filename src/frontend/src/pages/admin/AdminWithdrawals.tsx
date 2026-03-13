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
  useAdminWithdrawals,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

export function AdminWithdrawalsPage() {
  const { data: transactions = [], isLoading } = useAdminWithdrawals();
  const approveWithdraw = useAdminApproveWithdraw();

  const withdrawals = transactions.filter(
    (tx) => tx.txType === Variant_credit_debit.debit,
  );

  const handleAction = async (txId: bigint, approved: boolean) => {
    try {
      await approveWithdraw.mutateAsync({ txId, approved });
      toast.success(`Withdrawal ${approved ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    }
  };

  const statusBadge = (status: Variant_pending_approved_rejected) => {
    switch (status) {
      case Variant_pending_approved_rejected.pending:
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Pending
          </Badge>
        );
      case Variant_pending_approved_rejected.approved:
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Approved
          </Badge>
        );
      case Variant_pending_approved_rejected.rejected:
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Rejected
          </Badge>
        );
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
      ) : withdrawals.length === 0 ? (
        <div
          data-ocid="admin.withdrawals.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No withdrawal requests
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((tx, i) => (
            <div
              key={tx.id.toString()}
              data-ocid={`admin.withdrawals.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4 card-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      User: {tx.userId}
                    </p>
                    {statusBadge(tx.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {tx.note}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                  <p className="text-base font-bold text-primary mt-1">
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
                {tx.status === Variant_pending_approved_rejected.pending && (
                  <div className="flex flex-col gap-2">
                    <Button
                      data-ocid={`admin.withdrawals.approve_button.${i + 1}`}
                      size="sm"
                      className="gold-gradient text-primary-foreground text-xs h-8 rounded-lg"
                      onClick={() => handleAction(tx.id, true)}
                      disabled={approveWithdraw.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button
                      data-ocid={`admin.withdrawals.reject_button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg"
                      onClick={() => handleAction(tx.id, false)}
                      disabled={approveWithdraw.isPending}
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
