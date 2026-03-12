import { Skeleton } from "@/components/ui/skeleton";
import { GitFork } from "lucide-react";
import { useState } from "react";
import { BinaryTreeView } from "../components/BinaryTreeView";
import { useBinaryTree, useUserProfile } from "../hooks/useQueries";

export function BinaryTreePage() {
  const { data: profile } = useUserProfile();
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  const userId = viewUserId || profile?.id || null;
  const { data: treeData, isLoading } = useBinaryTree(userId);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <GitFork className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Binary Tree
          </h1>
          <p className="text-xs text-muted-foreground">
            Your network structure
          </p>
        </div>
      </div>

      {viewUserId && viewUserId !== profile?.id && (
        <button
          type="button"
          className="mb-4 text-sm text-primary hover:underline flex items-center gap-1"
          onClick={() => setViewUserId(null)}
          data-ocid="tree.back.button"
        >
          ← Back to my tree
        </button>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 card-glow shadow-card min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full space-y-4">
            <Skeleton className="h-20 w-24 mx-auto rounded-xl" />
            <div className="flex justify-center gap-8">
              <Skeleton className="h-20 w-24 rounded-xl" />
              <Skeleton className="h-20 w-24 rounded-xl" />
            </div>
          </div>
        ) : !treeData ? (
          <div data-ocid="tree.empty_state" className="text-center py-8">
            <GitFork className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tree data available</p>
          </div>
        ) : (
          <BinaryTreeView
            data={treeData}
            onViewSubtree={(id) => setViewUserId(id)}
          />
        )}
      </div>

      {treeData && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-bold text-foreground">
              {treeData.user.leftTeamCount?.toString() || "0"}
            </p>
            <p className="text-xs text-muted-foreground">Left Team</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-bold text-foreground">
              {treeData.user.rightTeamCount?.toString() || "0"}
            </p>
            <p className="text-xs text-muted-foreground">Right Team</p>
          </div>
        </div>
      )}
    </div>
  );
}
