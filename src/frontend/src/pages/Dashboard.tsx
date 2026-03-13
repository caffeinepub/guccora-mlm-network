import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Copy,
  GitFork,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Variant_level_direct_binary } from "../backend.d";
import { useUserDashboard, useUserProfile } from "../hooks/useQueries";
import { formatCurrency, formatDate, getToken } from "../utils/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useUserDashboard();
  const { data: profile } = useUserProfile();

  useEffect(() => {
    if (!getToken()) navigate({ to: "/login" });
  }, [navigate]);

  const referralLink = profile?.myReferralCode
    ? `https://guccora.app/register?ref=${profile.myReferralCode}`
    : "";

  const copyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  const incomeTypeBadge = (type: Variant_level_direct_binary) => {
    switch (type) {
      case Variant_level_direct_binary.direct:
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Direct
          </Badge>
        );
      case Variant_level_direct_binary.binary:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Binary
          </Badge>
        );
      case Variant_level_direct_binary.level:
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Level
          </Badge>
        );
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <h1 className="font-display text-xl font-bold text-foreground">
              {profile?.fullName || "Member"}
            </h1>
          )}
        </div>
        <img
          src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
          alt="Guccora"
          className="h-8 object-contain opacity-80"
        />
      </div>

      {/* Wallet Balance - Hero Card */}
      {isLoading ? (
        <Skeleton className="h-28 rounded-2xl mb-4" />
      ) : (
        <div
          data-ocid="dashboard.wallet_card"
          className="gold-gradient rounded-2xl p-5 mb-4 gold-glow relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary-foreground/70" />
              <p className="text-sm text-primary-foreground/80 font-medium">
                Wallet Balance
              </p>
            </div>
            <p className="font-display text-3xl font-bold text-primary-foreground">
              {formatCurrency(dashboard?.walletBalance || 0n)}
            </p>
            <Link
              to="/wallet"
              className="mt-2 inline-flex items-center text-xs text-primary-foreground/70 hover:text-primary-foreground"
            >
              View wallet <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          {
            label: "Total Income",
            value: dashboard?.totalIncome || 0n,
            icon: TrendingUp,
            color: "text-green-400",
          },
          {
            label: "Total Team",
            value: dashboard?.totalTeam || 0n,
            icon: Users,
            color: "text-blue-400",
            isCount: true,
          },
          {
            label: "Left Team",
            value: dashboard?.leftTeamCount || 0n,
            icon: GitFork,
            color: "text-amber-400",
            isCount: true,
          },
          {
            label: "Right Team",
            value: dashboard?.rightTeamCount || 0n,
            icon: GitFork,
            color: "text-amber-400",
            isCount: true,
          },
          {
            label: "Direct Referrals",
            value: dashboard?.directReferrals || 0n,
            icon: UserPlus,
            color: "text-purple-400",
            isCount: true,
          },
        ].map(({ label, value, icon: Icon, color, isCount }, i) =>
          isLoading ? (
            <Skeleton key={label} className="h-20 rounded-xl" />
          ) : (
            <div
              key={label}
              data-ocid={`dashboard.stat.card.${i + 1}`}
              className="bg-card border border-border rounded-xl p-3.5 card-glow"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-4 w-4 ${color}`} />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p
                className={`font-display text-xl font-bold ${
                  isCount ? "text-foreground" : "text-green-400"
                }`}
              >
                {isCount ? value.toString() : formatCurrency(value)}
              </p>
            </div>
          ),
        )}
      </div>

      {/* Income Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <div
              data-ocid="dashboard.direct_income.card"
              className="bg-card border border-green-500/20 rounded-xl p-3 card-glow"
            >
              <p className="text-xs text-muted-foreground mb-1 leading-tight">
                Direct Income
              </p>
              <p className="font-display text-base font-bold text-green-400">
                {formatCurrency(dashboard?.directIncome ?? 0n)}
              </p>
            </div>
            <div
              data-ocid="dashboard.binary_income.card"
              className="bg-card border border-blue-500/20 rounded-xl p-3 card-glow"
            >
              <p className="text-xs text-muted-foreground mb-1 leading-tight">
                Binary Pair
              </p>
              <p className="font-display text-base font-bold text-blue-400">
                {formatCurrency(dashboard?.binaryIncome ?? 0n)}
              </p>
            </div>
            <div
              data-ocid="dashboard.level_income.card"
              className="bg-card border border-purple-500/20 rounded-xl p-3 card-glow"
            >
              <p className="text-xs text-muted-foreground mb-1 leading-tight">
                Level Income
              </p>
              <p className="font-display text-base font-bold text-purple-400">
                {formatCurrency(dashboard?.levelIncome ?? 0n)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Referral Link */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 card-glow">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Your Referral Link
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-input rounded-lg px-3 py-2 text-xs text-foreground/80 truncate">
            {referralLink || "Loading..."}
          </div>
          <button
            type="button"
            data-ocid="dashboard.referral.copy_button"
            onClick={copyReferral}
            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recent Income */}
      <div className="bg-card border border-border rounded-xl p-4 card-glow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Recent Income</p>
          <Link
            to="/income"
            className="text-xs text-primary hover:underline"
            data-ocid="dashboard.income.link"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : !dashboard?.recentIncomeRecords?.length ? (
          <div
            data-ocid="dashboard.income.empty_state"
            className="text-center py-6 text-muted-foreground text-sm"
          >
            No income records yet
          </div>
        ) : (
          <div className="space-y-2">
            {dashboard.recentIncomeRecords.slice(0, 5).map((rec, i) => (
              <div
                key={rec.id?.toString()}
                data-ocid={`dashboard.income.item.${i + 1}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  {incomeTypeBadge(rec.incomeType)}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(rec.createdAt)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-400">
                  +{formatCurrency(rec.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
