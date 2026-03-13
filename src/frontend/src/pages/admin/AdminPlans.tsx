import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, Package, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlans } from "../../hooks/useQueries";
import { formatCurrency } from "../../utils/format";

const STORAGE_KEY = "guccora_plan_overrides";

type PlanOverride = { price: number; description: string };
type PlanOverrides = Record<string, PlanOverride>;

function loadOverrides(): PlanOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: PlanOverrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "1": "Direct income \u20b9100, Binary \u20b9200, Level income up to 10 levels",
  "2": "Direct income \u20b9150, Binary \u20b9300, Level income up to 10 levels",
  "3": "Direct income \u20b9200, Binary \u20b9400, Level income up to 10 levels",
};

export function AdminPlansPage() {
  const { data: plans = [], isLoading } = usePlans();
  const [overrides, setOverrides] = useState<PlanOverrides>(loadOverrides);
  const [editing, setEditing] = useState<
    Record<string, { price: string; description: string }>
  >({});

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

  const startEdit = (planId: string, currentPrice: bigint) => {
    const override = overrides[planId];
    setEditing((prev) => ({
      ...prev,
      [planId]: {
        price: override ? String(override.price) : currentPrice.toString(),
        description:
          override?.description ?? DEFAULT_DESCRIPTIONS[planId] ?? "",
      },
    }));
  };

  const cancelEdit = (planId: string) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[planId];
      return next;
    });
  };

  const savePlan = (planId: string) => {
    const form = editing[planId];
    if (!form) return;
    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const newOverrides = {
      ...overrides,
      [planId]: { price, description: form.description },
    };
    saveOverrides(newOverrides);
    setOverrides(newOverrides);
    cancelEdit(planId);
    toast.success("Plan updated successfully");
  };

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
          {displayPlans.map((plan, i) => {
            const planId = plan.id.toString();
            const override = overrides[planId];
            const displayPrice = override ? BigInt(override.price) : plan.price;
            const description =
              override?.description ?? DEFAULT_DESCRIPTIONS[planId] ?? "";
            const isEditing = !!editing[planId];
            const editForm = editing[planId];
            const priceInputId = `plan-price-${planId}`;
            const descInputId = `plan-desc-${planId}`;

            return (
              <div
                key={planId}
                data-ocid={`admin.plans.item.${i + 1}`}
                className="bg-card border border-border rounded-xl p-5 card-glow"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {plan.name}
                  </h3>
                  {!isEditing && (
                    <button
                      type="button"
                      data-ocid={`admin.plans.edit_button.${i + 1}`}
                      onClick={() => startEdit(planId, plan.price)}
                      className="p-1.5 rounded-md border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                      title="Edit plan"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label
                        htmlFor={priceInputId}
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Price (\u20b9)
                      </label>
                      <Input
                        id={priceInputId}
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            [planId]: {
                              ...prev[planId],
                              price: e.target.value,
                            },
                          }))
                        }
                        data-ocid={`admin.plans.price_input.${i + 1}`}
                        className="h-8 text-sm"
                        min={1}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={descInputId}
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Description
                      </label>
                      <Textarea
                        id={descInputId}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            [planId]: {
                              ...prev[planId],
                              description: e.target.value,
                            },
                          }))
                        }
                        data-ocid={`admin.plans.description_input.${i + 1}`}
                        className="text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => savePlan(planId)}
                        data-ocid={`admin.plans.save_button.${i + 1}`}
                        className="flex-1"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit(planId)}
                        data-ocid={`admin.plans.cancel_button.${i + 1}`}
                        className="flex-1"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-display text-3xl font-bold text-primary mb-2">
                      {formatCurrency(displayPrice)}
                    </p>
                    {description && (
                      <p className="text-xs text-muted-foreground mb-3">
                        {description}
                      </p>
                    )}
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
                        <span className="text-foreground/80">
                          10 Level Income
                        </span>
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
                              <span className="text-muted-foreground">
                                L{li + 1}
                              </span>
                              <br />
                              <span className="text-foreground font-medium">
                                {r.toString()}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
