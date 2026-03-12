import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../../config";
import { setAdminToken } from "../../utils/format";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      toast.error("Enter admin password");
      return;
    }
    setLoading(true);
    try {
      const actor = await createActorWithConfig();
      const token = await actor.adminLogin(password);
      if (!token) {
        toast.error("Invalid password");
        return;
      }
      setAdminToken(token);
      toast.success("Admin login successful");
      navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
            alt="Guccora"
            className="h-12 object-contain mb-3"
          />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Admin Panel
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 card-glow shadow-card">
          <h1 className="font-display text-xl font-bold text-foreground mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Restricted access
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="admin.password_input"
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-9 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <Button
              data-ocid="admin.login.submit_button"
              className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
