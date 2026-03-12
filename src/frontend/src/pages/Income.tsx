import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Variant_level_direct_binary } from "../backend.d";
import type { IncomeRecord } from "../backend.d";
import { useIncomeRecords } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../utils/format";

function IncomeCard({ rec, idx }: { rec: IncomeRecord; idx: number }) {
  const typeMap: Record<string, { label: string; cls: string }> = {
    [Variant_level_direct_binary.direct]: {
      label: "Direct",
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    [Variant_level_direct_binary.binary]: {
      label: "Binary",
      cls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    [Variant_level_direct_binary.level]: {
      label: "Level",
      cls: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
  };
  const t = typeMap[rec.incomeType] || { label: rec.incomeType, cls: "" };
  return (
    <div
      data-ocid={`income.item.${idx}`}
      className="flex items-center justify-between py-3 px-4 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge className={t.cls}>{t.label}</Badge>
            {rec.level != null && (
              <span className="text-xs text-muted-foreground">
                L{rec.level.toString()}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            From: {rec.fromUserId?.slice(0, 8)}... • {formatDate(rec.createdAt)}
          </p>
        </div>
      </div>
      <p className="font-semibold text-green-400">
        +{formatCurrency(rec.amount)}
      </p>
    </div>
  );
}

export function IncomePage() {
  const { data: records = [], isLoading } = useIncomeRecords();
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all" ? records : records.filter((r) => r.incomeType === tab);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Income History
          </h1>
          <p className="text-xs text-muted-foreground">
            Total: {formatCurrency(records.reduce((s, r) => s + r.amount, 0n))}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="grid grid-cols-4 bg-card border border-border w-full">
          <TabsTrigger
            value="all"
            data-ocid="income.all.tab"
            className="text-xs"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value={Variant_level_direct_binary.direct}
            data-ocid="income.direct.tab"
            className="text-xs"
          >
            Direct
          </TabsTrigger>
          <TabsTrigger
            value={Variant_level_direct_binary.binary}
            data-ocid="income.binary.tab"
            className="text-xs"
          >
            Binary
          </TabsTrigger>
          <TabsTrigger
            value={Variant_level_direct_binary.level}
            data-ocid="income.level.tab"
            className="text-xs"
          >
            Level
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="income.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No income records</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {filtered.map((rec, i) => (
                <IncomeCard key={rec.id?.toString()} rec={rec} idx={i + 1} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
