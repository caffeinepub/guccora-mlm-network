import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ExternalLink, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentStatus } from "../../backend.d";
import {
  useAdminApproveRegistration,
  useAdminPendingRegistrations,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

export function AdminRegistrationsPage() {
  const { data: registrations = [], isLoading } =
    useAdminPendingRegistrations();
  const approveRegistration = useAdminApproveRegistration();

  const handleAction = async (userId: string, approved: boolean) => {
    try {
      await approveRegistration.mutateAsync({ userId, approved });
      toast.success(
        approved
          ? "Registration approved. User can now login."
          : "Registration rejected.",
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const statusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.pendingVerification:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending Verification
          </Badge>
        );
      case PaymentStatus.approved:
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Approved
          </Badge>
        );
      case PaymentStatus.rejected:
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Rejected
          </Badge>
        );
    }
  };

  const pending = registrations.filter(
    (r) => r.paymentStatus === PaymentStatus.pendingVerification,
  );
  const others = registrations.filter(
    (r) => r.paymentStatus !== PaymentStatus.pendingVerification,
  );
  const sorted = [...pending, ...others];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <UserCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          New Registrations
        </h1>
        {pending.length > 0 && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {pending.length} pending
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="admin.registrations.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          No registrations yet
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((reg, i) => (
            <div
              key={reg.id}
              data-ocid={`admin.registrations.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-foreground">
                      {reg.fullName}
                    </p>
                    {statusBadge(reg.paymentStatus)}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Mobile
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {reg.mobile}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium text-foreground">
                        {reg.planName} &mdash; {formatCurrency(reg.planPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        UTR Number
                      </p>
                      <p className="text-sm font-mono text-foreground/80">
                        {reg.utrNumber || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Registered
                      </p>
                      <p className="text-sm text-foreground/80">
                        {formatDate(reg.joinedAt)}
                      </p>
                    </div>
                  </div>
                  {reg.screenshotUrl && (
                    <a
                      href={reg.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`admin.registrations.screenshot_button.${i + 1}`}
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Payment Screenshot
                    </a>
                  )}
                </div>
              </div>

              {reg.paymentStatus === PaymentStatus.pendingVerification && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    data-ocid={`admin.registrations.approve_button.${i + 1}`}
                    size="sm"
                    className="gold-gradient text-primary-foreground text-xs h-8 rounded-lg flex-1"
                    onClick={() => handleAction(reg.id, true)}
                    disabled={approveRegistration.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button
                    data-ocid={`admin.registrations.reject_button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg flex-1"
                    onClick={() => handleAction(reg.id, false)}
                    disabled={approveRegistration.isPending}
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
