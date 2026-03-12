import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GitFork, Search } from "lucide-react";
import { useState } from "react";
import { BinaryTreeView } from "../../components/BinaryTreeView";
import { useBinaryTree } from "../../hooks/useQueries";

export function AdminTreePage() {
  const [userId, setUserId] = useState("");
  const [queryId, setQueryId] = useState<string | null>(null);
  const { data: treeData, isLoading } = useBinaryTree(queryId);

  const handleSearch = () => {
    if (!userId.trim()) return;
    setQueryId(userId.trim());
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <GitFork className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Binary Tree Viewer
        </h1>
      </div>

      <div className="flex items-center gap-3 mb-5 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="admin.tree.search_input"
            placeholder="Enter User ID to view tree"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>
        <Button
          data-ocid="admin.tree.search_button"
          className="gold-gradient text-primary-foreground rounded-xl px-4 h-10"
          onClick={handleSearch}
        >
          View Tree
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 card-glow min-h-[300px] flex items-center justify-center">
        {!queryId ? (
          <div className="text-center">
            <GitFork className="h-16 w-16 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Enter a User ID to view their binary tree
            </p>
          </div>
        ) : isLoading ? (
          <div className="w-full space-y-4">
            <Skeleton className="h-20 w-24 mx-auto rounded-xl" />
            <div className="flex justify-center gap-8">
              <Skeleton className="h-20 w-24 rounded-xl" />
              <Skeleton className="h-20 w-24 rounded-xl" />
            </div>
          </div>
        ) : !treeData ? (
          <div data-ocid="admin.tree.empty_state" className="text-center">
            <p className="text-muted-foreground">No tree found for this user</p>
          </div>
        ) : (
          <BinaryTreeView
            data={treeData}
            onViewSubtree={(id) => {
              setUserId(id);
              setQueryId(id);
            }}
          />
        )}
      </div>
    </div>
  );
}
