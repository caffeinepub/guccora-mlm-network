import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, Edit2, LogOut, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserProfile } from "../hooks/useQueries";
import { useUpdateProfile } from "../hooks/useQueries";
import { clearToken, formatCurrency } from "../utils/format";

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const handleEdit = () => {
    setNewName(profile?.fullName || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateProfile.mutateAsync({ fullName: newName });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleLogout = () => {
    clearToken();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  const copyReferral = () => {
    const link = `https://guccora.app/register?ref=${profile?.myReferralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral code copied!");
  };

  const planNames: Record<string, string> = {
    "1": "Starter",
    "2": "Growth",
    "3": "Premium",
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <h1 className="font-display text-xl font-bold text-foreground mb-5">
        My Profile
      </h1>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-5 card-glow mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center gold-glow">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <Skeleton className="h-6 w-32 mb-1" />
            ) : editing ? (
              <div className="flex items-center gap-2">
                <Input
                  data-ocid="profile.name_input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 bg-input border-border text-foreground text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="text-primary hover:text-primary/80"
                  data-ocid="profile.save_button"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-muted-foreground"
                  data-ocid="profile.cancel_button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground truncate">
                  {profile?.fullName}
                </h2>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="text-muted-foreground hover:text-primary"
                  data-ocid="profile.edit_button"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{profile?.mobile}</p>
            <Badge className="mt-1 bg-primary/20 text-primary border-primary/30">
              {planNames[profile?.planId?.toString() || ""] || "Starter"} Plan
            </Badge>
          </div>
        </div>
      </div>

      {/* Income breakdown */}
      <div className="bg-card border border-border rounded-2xl p-4 card-glow mb-4">
        <p className="text-sm font-semibold text-foreground mb-3">
          Income Breakdown
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              {
                label: "Direct Income",
                value: profile?.directIncome || 0n,
                color: "text-green-400",
              },
              {
                label: "Binary Income",
                value: profile?.binaryIncome || 0n,
                color: "text-blue-400",
              },
              {
                label: "Level Income",
                value: profile?.levelIncome || 0n,
                color: "text-purple-400",
              },
              {
                label: "Total Income",
                value: profile?.totalIncome || 0n,
                color: "text-primary",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>
                  {formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral code */}
      <div className="bg-card border border-border rounded-xl p-4 card-glow mb-4">
        <Label className="text-xs text-muted-foreground block mb-2">
          Referral Code
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-input rounded-lg px-3 py-2 font-mono text-sm text-primary font-bold tracking-widest">
            {profile?.myReferralCode || "—"}
          </div>
          <button
            type="button"
            data-ocid="profile.referral.copy_button"
            onClick={copyReferral}
            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        data-ocid="profile.logout.button"
        variant="outline"
        className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl h-11"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
