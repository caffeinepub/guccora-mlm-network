import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Hash,
  ImageIcon,
  Loader2,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Plan } from "../backend.d";
import { createActorWithConfig } from "../config";
import { usePlans } from "../hooks/useQueries";
import { formatCurrency } from "../utils/format";

const STEP_LABELS = ["Details", "Plan", "Payment"];

export function RegisterPage() {
  const navigate = useNavigate();
  const { data: plans = [] } = usePlans();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sponsorCode, setSponsorCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleStep1 = () => {
    if (
      !fullName.trim() ||
      !mobile ||
      mobile.length < 10 ||
      !sponsorCode.trim()
    ) {
      toast.error("Fill all fields with valid data");
      return;
    }
    setStep(2);
  };

  const handleStep2 = () => {
    if (!selectedPlan) {
      toast.error("Select a plan");
      return;
    }
    setStep(3);
  };

  const handleRegister = async () => {
    if (!upiRef.trim() || upiRef.length < 6) {
      toast.error("Enter a valid UTR / Transaction ID (min 6 characters)");
      return;
    }
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const actor = await createActorWithConfig();
      await actor.registerUser(
        fullName,
        mobile,
        sponsorCode,
        selectedPlan.id,
        upiRef,
        screenshotUrl,
      );
      setRegistered(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText("guccora@upi").then(() => {
      setUpiCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  const staticPlans = [
    {
      id: BigInt(1),
      name: "Starter Plan",
      price: BigInt(599),
      directIncomePercent: BigInt(10),
      binaryIncomePercent: BigInt(5),
      levelIncomeRates: [] as bigint[],
    },
    {
      id: BigInt(2),
      name: "Growth Plan",
      price: BigInt(999),
      directIncomePercent: BigInt(15),
      binaryIncomePercent: BigInt(8),
      levelIncomeRates: [] as bigint[],
    },
    {
      id: BigInt(3),
      name: "Premium Plan",
      price: BigInt(1999),
      directIncomePercent: BigInt(20),
      binaryIncomePercent: BigInt(10),
      levelIncomeRates: [] as bigint[],
    },
  ];
  const displayPlans = plans.length > 0 ? plans : staticPlans;

  // Registration success - pending verification screen
  if (registered) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div
            data-ocid="register.pending.panel"
            className="bg-card border border-border rounded-2xl p-6 card-glow shadow-card text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Registration Submitted!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your payment is being verified by our admin team.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-yellow-400">
                Account Status: Payment Pending Verification
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You will be able to login once the admin approves your payment.
                This usually takes a few hours.
              </p>
            </div>
            <div className="text-left bg-accent/20 rounded-xl px-4 py-3 mb-5 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mobile</span>
                <span className="text-foreground font-medium">{mobile}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">
                  {selectedPlan?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">UTR</span>
                <span className="font-mono text-foreground/80 text-xs">
                  {upiRef}
                </span>
              </div>
            </div>
            <Button
              data-ocid="register.pending.login_button"
              className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
              onClick={() => navigate({ to: "/" })}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-start px-5 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          )}
          <img
            src="/assets/generated/guccora-logo-transparent.dim_400x120.png"
            alt="Guccora"
            className="h-8 object-contain"
          />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step > i + 1
                      ? "gold-gradient text-primary-foreground"
                      : step === i + 1
                        ? "border-2 border-primary text-primary"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-px mt-[-14px] ${
                    step > i + 1 ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 card-glow shadow-card">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Personal Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your information
                </p>
              </div>
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.fullname_input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.mobile_input"
                    type="tel"
                    placeholder="10-digit mobile"
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
                  Sponsor Referral Code
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.sponsor_input"
                    placeholder="Sponsor code"
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <Button
                data-ocid="register.next_button"
                className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
                onClick={handleStep1}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Choose Your Plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a membership plan
                </p>
              </div>
              <div className="space-y-3">
                {displayPlans.map((p, idx) => (
                  <button
                    type="button"
                    key={p.id.toString()}
                    data-ocid={`register.plan.item.${idx + 1}`}
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedPlan?.id === p.id
                        ? "border-primary bg-primary/10 gold-glow"
                        : "border-border bg-accent/20 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">
                        {p.name}
                      </span>
                      <span className="font-display text-xl font-bold text-primary">
                        {formatCurrency(p.price)}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Direct: {p.directIncomePercent?.toString()}%</span>
                      <span>Binary: {p.binaryIncomePercent?.toString()}%</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                data-ocid="register.plan_next_button"
                className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
                onClick={handleStep2}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 3 - Payment + Register */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Heading with amount */}
              <div className="text-center">
                <h2 className="font-display text-lg font-bold text-foreground">
                  UPI Payment
                </h2>
                {selectedPlan && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-gradient">
                    <span className="text-sm font-bold text-primary-foreground">
                      Pay {formatCurrency(selectedPlan.price)} via UPI
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-yellow-400/40">
                  <img
                    src="/assets/generated/upi-qr-code.dim_400x450.png"
                    alt="UPI QR Code - Scan to pay"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan QR code with any UPI app
                </p>
              </div>

              {/* UPI ID & Name */}
              <div className="bg-accent/30 border border-border rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">UPI ID</span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="font-bold text-sm text-primary tracking-wide">
                      guccora@upi
                    </span>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                      {upiCopied ? "Copied!" : "Tap to copy"}
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="font-semibold text-sm text-foreground">
                    PUTTAPALLI RAVITEJA
                  </span>
                </div>
              </div>

              {/* Payment app badges */}
              <div className="flex items-center justify-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#5f259f" }}
                >
                  PhonePe
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#1a73e8" }}
                >
                  Google Pay
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#00a0e3" }}
                >
                  Paytm
                </span>
              </div>

              {/* UTR Input */}
              <div>
                <Label className="text-sm text-foreground/80 mb-1 block">
                  Enter UTR / Transaction ID{" "}
                  <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.upi_ref_input"
                    placeholder="e.g. 123456789012"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  After payment, enter the 12-digit UTR number from your payment
                  app
                </p>
              </div>

              {/* Screenshot URL (optional) */}
              <div>
                <Label className="text-sm text-foreground/80 mb-1 block">
                  Payment Screenshot URL{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.screenshot_input"
                    placeholder="Paste image link (Google Drive, etc.)"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                data-ocid="register.submit_button"
                className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Your account will be activated after admin verifies your
                payment.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-primary hover:underline"
            data-ocid="register.login.link"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
