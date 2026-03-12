import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Check, Package } from "lucide-react";
import { usePlans } from "../hooks/useQueries";
import { formatCurrency } from "../utils/format";

const PLAN_FEATURES = [
  [
    "Direct income: 10%",
    "Binary income: 5%",
    "10 level income",
    "Referral link",
    "Dashboard access",
  ],
  [
    "Direct income: 15%",
    "Binary income: 8%",
    "10 level income",
    "Priority support",
    "Advanced analytics",
  ],
  [
    "Direct income: 20%",
    "Binary income: 10%",
    "10 level income",
    "VIP support",
    "Maximum earnings",
    "Exclusive events",
  ],
];

const PLAN_COLORS = [
  "border-border",
  "border-primary/60 bg-primary/5",
  "border-gold bg-primary/10",
];

const PLAN_TAGS = ["", "Popular", "Best Value"];

export function PlansPage() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading } = usePlans();

  const displayPlans =
    plans.length > 0
      ? plans
      : [
          {
            id: BigInt(1),
            name: "Starter Plan",
            price: BigInt(599),
            directIncomePercent: BigInt(10),
            binaryIncomePercent: BigInt(5),
            levelIncomeRates: [],
          },
          {
            id: BigInt(2),
            name: "Growth Plan",
            price: BigInt(999),
            directIncomePercent: BigInt(15),
            binaryIncomePercent: BigInt(8),
            levelIncomeRates: [],
          },
          {
            id: BigInt(3),
            name: "Premium Plan",
            price: BigInt(1999),
            directIncomePercent: BigInt(20),
            binaryIncomePercent: BigInt(10),
            levelIncomeRates: [],
          },
        ];

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Membership Plans
          </h1>
          <p className="text-xs text-muted-foreground">
            Choose your growth path
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayPlans.map((plan, idx) => (
            <div
              key={plan.id.toString()}
              data-ocid={`plans.item.${idx + 1}`}
              className={`relative bg-card border-2 rounded-2xl p-5 card-glow transition-all ${PLAN_COLORS[idx % 3]}`}
            >
              {PLAN_TAGS[idx % 3] && (
                <div className="absolute -top-3 right-4">
                  <span className="gold-gradient text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {PLAN_TAGS[idx % 3]}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Direct: {plan.directIncomePercent?.toString()}%</span>
                    <span>Binary: {plan.binaryIncomePercent?.toString()}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-primary">
                    {formatCurrency(plan.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">one-time</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {(PLAN_FEATURES[idx % 3] || []).map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button
                data-ocid={`plans.item.${idx + 1}.button`}
                className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-10"
                onClick={() => navigate({ to: "/register" })}
              >
                Get This Plan
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
