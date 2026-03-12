import { Skeleton } from "@/components/ui/skeleton";
import { Check, Package } from "lucide-react";
import { usePlans } from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

export function AdminPlansPage() {
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
            levelIncomeRates: Array(10).fill(BigInt(1)),
          },
          {
            id: BigInt(2),
            name: "Growth Plan",
            price: BigInt(999),
            directIncomePercent: BigInt(15),
            binaryIncomePercent: BigInt(8),
            levelIncomeRates: Array(10).fill(BigInt(2)),
          },
          {
            id: BigInt(3),
            name: "Premium Plan",
            price: BigInt(1999),
            directIncomePercent: BigInt(20),
            binaryIncomePercent: BigInt(10),
            levelIncomeRates: Array(10).fill(BigInt(3)),
          },
        ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Plans
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPlans.map((plan, i) => (
            <div
              key={plan.id.toString()}
              data-ocid={`admin.plans.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-5 card-glow"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="font-display text-3xl font-bold text-primary mb-3">
                {formatCurrency(plan.price)}
              </p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-foreground/80">
                    Direct: {plan.directIncomePercent?.toString()}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-foreground/80">
                    Binary: {plan.binaryIncomePercent?.toString()}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-foreground/80">10 Level Income</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  Level Rates (%)
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {(plan.levelIncomeRates.length > 0
                    ? plan.levelIncomeRates
                    : Array(10).fill(BigInt(0))
                  )
                    .slice(0, 10)
                    .map((r, li) => (
                      <div
                        key={`rate-lvl-${li + 1}`}
                        className="bg-accent/30 rounded text-center py-1 text-xs"
                      >
                        <span className="text-muted-foreground">L{li + 1}</span>
                        <br />
                        <span className="text-foreground font-medium">
                          {r.toString()}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
