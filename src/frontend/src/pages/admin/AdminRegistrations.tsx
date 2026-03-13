import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ExternalLink, UserCheck, XCircle } from "lucide-react";
import { useState } from "react";
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
      {/* Lightbox overlay */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          data-ocid="admin.registrations.modal"
        >
          <img
            src={lightboxSrc}
            alt="Payment screenshot"
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl border-2 border-yellow-400/30 object-contain"
          />
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-bold leading-none"
            onClick={() => setLightboxSrc(null)}
            data-ocid="admin.registrations.close_button"
          >
            &times;
          </button>
          {/* Backdrop click to close */}
          <button
            type="button"
            aria-label="Close screenshot"
            className="absolute inset-0 -z-10 w-full h-full cursor-default"
            onClick={() => setLightboxSrc(null)}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <UserCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Payments Verification
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
                        Transaction ID
                      </p>
                      <p className="text-sm font-mono text-foreground/80">
                        {reg.utrNumber || "\u2014"}
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

                  {/* Screenshot display - base64 */}
                  {reg.screenshotUrl?.startsWith("data:") && (
                    <div className="mt-3">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        Payment Screenshot
                      </p>
                      <button
                        type="button"
                        data-ocid={`admin.registrations.screenshot_button.${i + 1}`}
                        className="block rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity p-0 bg-transparent"
                        onClick={() => setLightboxSrc(reg.screenshotUrl)}
                      >
                        <img
                          src={reg.screenshotUrl}
                          alt="Payment screenshot"
                          className="rounded-lg object-cover"
                          style={{ maxHeight: "120px" }}
                        />
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Tap to view full size
                      </p>
                    </div>
                  )}

                  {/* Screenshot display - external link */}
                  {reg.screenshotUrl?.startsWith("http") && (
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
