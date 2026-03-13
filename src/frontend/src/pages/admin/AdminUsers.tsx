import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  Loader2,
  Pencil,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserDto } from "../../backend.d";
import {
  useAdminActivateUser,
  useAdminDeleteUser,
  useAdminUpdateUser,
  useAdminUserList,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../utils/format";

const PLAN_NAMES: Record<string, string> = {
  "1": "Starter",
  "2": "Growth",
  "3": "Premium",
};

function StatusBadge({ user }: { user: UserDto }) {
  if (user.isActive) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
        Active
      </Badge>
    );
  }
  if (user.paymentStatus === "pendingVerification") {
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-medium">
        Pending
      </Badge>
    );
  }
  if (user.paymentStatus === "rejected") {
    return (
      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium">
      Inactive
    </Badge>
  );
}

function PlanBadge({ planId }: { planId: bigint }) {
  const name = PLAN_NAMES[planId?.toString()] || "Unknown";
  const styles =
    name === "Premium"
      ? "bg-primary/20 text-primary border-primary/30"
      : name === "Growth"
        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
        : "bg-muted/50 text-muted-foreground border-border";
  return <Badge className={`text-xs border ${styles}`}>{name}</Badge>;
}

export function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUserList();
  const activateUser = useAdminActivateUser();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<UserDto | null>(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search),
  );

  const handleToggle = async (userId: string, currentActive: boolean) => {
    try {
      await activateUser.mutateAsync({ userId, isActive: !currentActive });
      toast.success(
        `User ${!currentActive ? "activated" : "deactivated"} successfully`,
      );
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const openEdit = (user: UserDto) => {
    setEditTarget(user);
    setEditName(user.fullName);
    setEditMobile(user.mobile);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await updateUser.mutateAsync({
        userId: editTarget.id,
        fullName: editName.trim(),
        mobile: editMobile.trim(),
      });
      toast.success("User updated successfully");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync({ userId: deleteTarget.id });
      toast.success(`${deleteTarget.fullName} has been deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground leading-tight">
            Users Management
          </h1>
          <p className="text-xs text-muted-foreground">
            {users.length} total members
          </p>
        </div>
        <Badge className="ml-auto bg-primary/20 text-primary border border-primary/30 text-sm px-3">
          {users.length}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="admin.users.search_input"
          placeholder="Search by name or mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.users.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="admin.users.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold mb-1">No users found</p>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try a different search term"
              : "No members have joined yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-10 pl-4">
                    #
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Mobile
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                    Plan
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                    Wallet
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user, i) => (
                  <TableRow
                    key={user.id}
                    data-ocid={`admin.users.item.${i + 1}`}
                    className="border-b border-border/50 hover:bg-white/[0.03] transition-colors"
                  >
                    <TableCell className="pl-4 text-muted-foreground text-sm font-mono">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {user.mobile}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell font-mono">
                      {user.mobile}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <PlanBadge planId={user.planId} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge user={user} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground hidden md:table-cell font-medium">
                      {formatCurrency(user.walletBalance)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {formatDate(user.joinedAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit */}
                        <Button
                          data-ocid={`admin.users.edit_button.${i + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          onClick={() => openEdit(user)}
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Activate / Deactivate */}
                        {user.isActive ? (
                          <Button
                            data-ocid={`admin.users.deactivate_button.${i + 1}`}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                            onClick={() => handleToggle(user.id, true)}
                            disabled={activateUser.isPending}
                            title="Deactivate user"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            data-ocid={`admin.users.activate_button.${i + 1}`}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            onClick={() => handleToggle(user.id, false)}
                            disabled={activateUser.isPending}
                            title="Activate user"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          data-ocid={`admin.users.delete_button.${i + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent
          data-ocid="admin.edit_user.dialog"
          className="bg-card border-border max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-foreground">
              Edit User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Full Name</Label>
              <Input
                data-ocid="admin.edit_user.name_input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter full name"
                className="bg-input border-border text-foreground focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Mobile Number
              </Label>
              <Input
                data-ocid="admin.edit_user.mobile_input"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="bg-input border-border text-foreground focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.edit_user.cancel_button"
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
              onClick={() => setEditTarget(null)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.edit_user.save_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveEdit}
              disabled={
                updateUser.isPending || !editName.trim() || !editMobile.trim()
              }
            >
              {updateUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.delete_user.dialog"
          className="bg-card border-border max-w-md"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.fullName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="admin.delete_user.cancel_button"
              className="border-border text-muted-foreground hover:text-foreground"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_user.confirm_button"
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
