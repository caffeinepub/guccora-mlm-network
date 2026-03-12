import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Variant_verified_pending_rejected } from "../../backend.d";
import {
  useAdminPayments,
  useAdminVerifyPayment,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

export function AdminPaymentsPage() {
  const { data: payments = [], isLoading } = useAdminPayments();
  const verifyPayment = useAdminVerifyPayment();

  const handleAction = async (paymentId: bigint, verified: boolean) => {
    try {
      await verifyPayment.mutateAsync({ paymentId, verified });
      toast.success(`Payment ${verified ? "verified" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    }
  };

  const statusBadge = (status: Variant_verified_pending_rejected) => {
    switch (status) {
      case Variant_verified_pending_rejected.verified:
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Verified
          </Badge>
        );
      case Variant_verified_pending_rejected.pending:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case Variant_verified_pending_rejected.rejected:
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
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Payments
        </h1>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          {payments.length}
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div
          data-ocid="admin.payments.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No payments yet
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <div
              key={p.id?.toString()}
              data-ocid={`admin.payments.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(p.amount)}
                    </p>
                    {statusBadge(p.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    UPI Ref:{" "}
                    <span className="font-mono text-foreground/70">
                      {p.upiRef}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    User: {p.userId?.slice(0, 12)}... •{" "}
                    {formatDate(p.createdAt)}
                  </p>
                </div>
              </div>
              {p.status === Variant_verified_pending_rejected.pending && (
                <div className="flex gap-2">
                  <Button
                    data-ocid={`admin.payments.verify_button.${i + 1}`}
                    size="sm"
                    className="gold-gradient text-primary-foreground text-xs h-8 rounded-lg"
                    onClick={() => handleAction(p.id, true)}
                    disabled={verifyPayment.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Verify
                  </Button>
                  <Button
                    data-ocid={`admin.payments.reject_button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg"
                    onClick={() => handleAction(p.id, false)}
                    disabled={verifyPayment.isPending}
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
