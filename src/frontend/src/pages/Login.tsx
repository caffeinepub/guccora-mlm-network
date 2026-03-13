import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Eye, EyeOff, Loader2, Lock, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { setToken } from "../utils/format";

export function LoginPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleLogin = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!password.trim()) {
      toast.error("Enter your password");
      return;
    }
    setLoading(true);
    setPendingApproval(false);
    try {
      const actor = await createActorWithConfig();
      const token = await actor.loginUserByMobile(mobile, password);
      if (!token) {
        toast.error("Account not found. Please register first.");
        return;
      }
      setToken(token);
      toast.success("Login successful!");
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (
        msg.includes("pending admin approval") ||
        msg.includes("Payment Pending")
      ) {
        setPendingApproval(true);
      } else if (msg.includes("rejected")) {
        toast.error("Your registration was rejected. Please contact support.");
      } else if (msg.includes("Invalid password")) {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error("Login failed. Mobile number not registered.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
            alt="Guccora MLM Network"
            className="h-14 object-contain mb-3"
          />
          <p className="text-muted-foreground text-sm text-center">
            Build your network, grow your income
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 card-glow shadow-card">
          <h1 className="font-display text-xl font-bold text-foreground mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Login to your account
          </p>

          {pendingApproval && (
            <div
              data-ocid="login.pending_state"
              className="mb-4 flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3"
            >
              <Clock className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">
                  Payment Pending Verification
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your account is awaiting admin approval. You will be able to
                  login once your payment is verified.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="login.mobile_input"
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="login.password_input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              data-ocid="login.submit_button"
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

          <div className="mt-5 pt-4 border-t border-border text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              New to Guccora?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
                data-ocid="login.register.link"
              >
                Join Now
              </Link>
            </p>
            <Link
              to="/admin/login"
              className="block text-xs text-muted-foreground/60 hover:text-muted-foreground"
              data-ocid="login.admin.link"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
