import { User } from "lucide-react";
import type { UserDto } from "../backend.d";

interface TreeData {
  user: UserDto;
  left?: UserDto;
  right?: UserDto;
}

interface Props {
  data: TreeData;
  onViewSubtree?: (userId: string) => void;
}

function UserCard({
  user,
  label,
  onView,
}: { user: UserDto; label: string; onView?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <button
        type="button"
        className="bg-card border border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/50 transition-colors card-glow min-w-[100px] w-full"
        onClick={onView}
      >
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center mx-auto mb-1.5">
          <User className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs font-semibold text-foreground truncate max-w-[90px]">
          {user.fullName}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Plan #{user.planId?.toString() || "—"}
        </p>
      </button>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="bg-card/40 border border-dashed border-border rounded-xl p-3 text-center min-w-[100px]">
        <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-1.5">
          <User className="h-4 w-4 text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground/50">Empty</p>
      </div>
    </div>
  );
}

export function BinaryTreeView({ data, onViewSubtree }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 overflow-x-auto">
      {/* Root node */}
      <UserCard user={data.user} label="You" />

      {/* Connector lines */}
      <div className="relative w-full flex justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-primary/40" />
        <div className="flex items-start gap-4 pt-6">
          {/* Left branch line */}
          <div className="flex flex-col items-end">
            <div className="w-16 h-px bg-primary/30 -mb-px" />
          </div>
          <div className="w-4" />
          {/* Right branch line */}
          <div className="flex flex-col items-start">
            <div className="w-16 h-px bg-primary/30 -mb-px" />
          </div>
        </div>
      </div>

      {/* Children */}
      <div className="flex items-start gap-8">
        {/* Left child */}
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-primary/30" />
          {data.left ? (
            <UserCard
              user={data.left}
              label="Left"
              onView={
                onViewSubtree ? () => onViewSubtree(data.left!.id) : undefined
              }
            />
          ) : (
            <EmptySlot label="Left" />
          )}
        </div>

        {/* Right child */}
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-primary/30" />
          {data.right ? (
            <UserCard
              user={data.right}
              label="Right"
              onView={
                onViewSubtree ? () => onViewSubtree(data.right!.id) : undefined
              }
            />
          ) : (
            <EmptySlot label="Right" />
          )}
        </div>
      </div>
    </div>
  );
}
