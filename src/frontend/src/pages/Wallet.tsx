import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Wallet as WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Variant_credit_debit,
  Variant_pending_approved_rejected,
} from "../backend.d";
import type { WalletTransaction } from "../backend.d";
import {
  useUserDashboard,
  useWalletHistory,
  useWithdrawRequest,
} from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../utils/format";

function StatusBadge({
  status,
}: { status: Variant_pending_approved_rejected }) {
  switch (status) {
    case Variant_pending_approved_rejected.pending:
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
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
}

function TxRow({ tx, idx }: { tx: WalletTransaction; idx: number }) {
  const isCredit = tx.txType === Variant_credit_debit.credit;
  return (
    <div
      data-ocid={`wallet.tx.item.${idx}`}
      className="flex items-center justify-between py-3 px-4 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCredit ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          {isCredit ? (
            <ArrowDown className="h-4 w-4 text-green-400" />
          ) : (
            <ArrowUp className="h-4 w-4 text-red-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {tx.note || (isCredit ? "Credit" : "Withdrawal")}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(tx.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${isCredit ? "text-green-400" : "text-red-400"}`}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </p>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  );
}

export function WalletPage() {
  const { data: dashboard, isLoading: dashLoading } = useUserDashboard();
  const { data: history = [], isLoading } = useWalletHistory();
  const withdraw = useWithdrawRequest();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) {
      toast.error("Minimum withdrawal is ₹100");
      return;
    }
    const balance = Number(dashboard?.walletBalance || 0n);
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
    try {
      await withdraw.mutateAsync({ amount: amt });
      toast.success("Withdrawal request submitted!");
      setOpen(false);
      setAmount("");
    } catch {
      toast.error("Withdrawal request failed");
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <WalletIcon className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">
          Wallet
        </h1>
      </div>

      {/* Balance Card */}
      {dashLoading ? (
        <Skeleton className="h-32 rounded-2xl mb-4" />
      ) : (
        <div className="gold-gradient rounded-2xl p-5 mb-4 gold-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <p className="text-sm text-primary-foreground/70 mb-1">
            Available Balance
          </p>
          <p className="font-display text-4xl font-bold text-primary-foreground mb-3">
            {formatCurrency(dashboard?.walletBalance || 0n)}
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="wallet.withdraw_button"
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border border-primary-foreground/30 rounded-xl h-9 px-4"
              >
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="wallet.withdraw.dialog"
              className="bg-card border-border max-w-sm mx-auto"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground font-display">
                  Withdraw Request
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-foreground/80 text-sm mb-1.5 block">
                    Amount (₹)
                  </Label>
                  <Input
                    data-ocid="wallet.amount_input"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Min: ₹100 | Available:{" "}
                    {formatCurrency(dashboard?.walletBalance || 0n)}
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-border"
                  data-ocid="wallet.withdraw.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="wallet.submit_button"
                  className="gold-gradient text-primary-foreground"
                  onClick={handleWithdraw}
                  disabled={withdraw.isPending}
                >
                  {withdraw.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-card border border-border rounded-xl p-4 card-glow">
        <p className="text-sm font-semibold text-foreground mb-3">
          Transaction History
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div
            data-ocid="wallet.tx.empty_state"
            className="text-center py-8 text-muted-foreground text-sm"
          >
            No transactions yet
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((tx, i) => (
              <TxRow key={tx.id?.toString()} tx={tx} idx={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
