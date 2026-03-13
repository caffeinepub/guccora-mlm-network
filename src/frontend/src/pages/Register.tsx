import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Loader2,
  MessageSquare,
  Phone,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Plan } from "../backend.d";
import { createActorWithConfig } from "../config";
import { usePlans } from "../hooks/useQueries";
import { formatCurrency } from "../utils/format";
import { getPaymentSettings } from "./admin/AdminSettings";

const STEP_LABELS = ["Details", "Verify OTP", "Plan", "Payment"];

const TEST_OTP = "1234";

export function RegisterPage() {
  const navigate = useNavigate();
  const refCode = new URLSearchParams(window.location.search).get("ref") ?? "";

  const { data: plans = [] } = usePlans();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sponsorCode, setSponsorCode] = useState(refCode);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Payment settings from admin
  const paymentSettings = getPaymentSettings();
  const activeUpiId = paymentSettings.upiId || "guccora@upi";
  const activeUpiName = paymentSettings.upiName || "PUTTAPALLI RAVITEJA";
  const activeAmount = paymentSettings.activationAmount || "599";
  const activeQrCode = paymentSettings.qrCodeDataUrl;

  const paymentInstructions = [
    "Scan the QR code using PhonePe, Google Pay, Paytm or BHIM",
    `Pay the activation amount \u20b9${activeAmount}`,
    "After payment, enter the Transaction ID below",
    "Upload your payment screenshot",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (refCode) setSponsorCode(refCode);
  }, [refCode]);

  const handleStep1 = async () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error("Enter your full name (min 3 characters)");
      return;
    }
    if (!mobile || mobile.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Test OTP mode: skip external SMS, go directly to OTP step
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      setStep(2);
      toast.success("OTP sent! Use test OTP: 1234");
    }, 500);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      if (otp === TEST_OTP) {
        setStep(3);
        toast.success("Mobile number verified!");
      } else {
        toast.error("Invalid OTP. Use test OTP: 1234");
      }
    }, 400);
  };

  const handleResendOtp = () => {
    toast.success("OTP resent! Use test OTP: 1234");
  };

  const handleStep3 = () => {
    if (!selectedPlan) {
      toast.error("Select a plan");
      return;
    }
    setStep(4);
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
        password,
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
    navigator.clipboard.writeText(activeUpiId).then(() => {
      setUpiCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setScreenshotUrl(result);
      }
    };
    reader.readAsDataURL(file);
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
              onClick={() => navigate({ to: "/login" })}
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
              to="/login"
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
        <div className="flex items-center gap-1 mb-6">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1">
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
                <span className="text-[9px] text-muted-foreground text-center leading-tight">
                  {label}
                </span>
              </div>
              {i < 3 && (
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
          {/* Step 1 - Personal Details + Password */}
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
                  Create Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.password_input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
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
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-ocid="register.confirm_password_input"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Sponsor Referral Code{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
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
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {otpLoading ? "Sending OTP..." : "Send OTP & Continue"}
              </Button>
            </div>
          )}

          {/* Step 2 - OTP Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Verify Mobile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the OTP for{" "}
                  <span className="text-foreground font-semibold">
                    {mobile}
                  </span>
                </p>
              </div>

              {/* Test OTP notice */}
              <div
                data-ocid="register.test_otp.panel"
                className="bg-green-500/15 border border-green-500/40 rounded-xl px-4 py-3 text-center"
              >
                <p className="text-sm font-bold text-green-400">
                  Test OTP: 1234
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  SMS is disabled in test mode. Enter 1234 to continue.
                </p>
              </div>

              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block text-center">
                  Enter 4-digit OTP
                </Label>
                <Input
                  data-ocid="register.otp_input"
                  type="tel"
                  placeholder="_ _ _ _"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest font-bold h-14"
                  maxLength={4}
                />
              </div>
              <Button
                data-ocid="register.otp_verify_button"
                className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
                onClick={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-xs text-primary hover:underline"
                  data-ocid="register.otp_resend_button"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Choose Plan */}
          {step === 3 && (
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
                onClick={handleStep3}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 4 - Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="font-display text-lg font-bold text-foreground">
                  UPI Payment
                </h2>
                {selectedPlan && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-gradient">
                    <span className="text-sm font-bold text-primary-foreground">
                      Pay ₹{activeAmount} via UPI
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code - dynamic from admin settings */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-yellow-400/40">
                  {activeQrCode ? (
                    <img
                      src={activeQrCode}
                      alt="UPI QR Code - Scan to pay"
                      className="w-56 h-56 object-contain"
                    />
                  ) : (
                    <img
                      src="/assets/uploads/AccountQRCodeCentral-Bank-Of-India-5251_LIGHT_THEME-1-1.png"
                      alt="UPI QR Code - Scan to pay"
                      className="w-56 h-56 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/uploads/AccountQRCodeCentral-Bank-Of-India-5251_LIGHT_THEME-1.png";
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan QR code with any UPI app
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                  How to Pay
                </p>
                {paymentInstructions.map((instruction, idx) => (
                  <div key={instruction} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/30 text-yellow-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>

              {/* UPI ID & Name - dynamic */}
              <div className="bg-accent/30 border border-border rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">UPI ID</span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="font-bold text-sm text-primary tracking-wide">
                      {activeUpiId}
                    </span>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                      {upiCopied ? "Copied!" : "Tap to copy"}
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="font-semibold text-sm text-foreground">
                    {activeUpiName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="font-bold text-sm text-primary">
                    ₹{activeAmount}
                  </span>
                </div>
              </div>

              {/* Payment app badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
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
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#FF6600" }}
                >
                  BHIM
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

              {/* Screenshot Upload */}
              <div>
                <Label className="text-sm text-foreground/80 mb-1 block">
                  Upload Payment Screenshot{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  data-ocid="register.screenshot_upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed border-border bg-accent/20 hover:border-primary/60 hover:bg-accent/40 transition-all text-left"
                >
                  <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {screenshotFileName
                      ? screenshotFileName
                      : "Tap to upload screenshot"}
                  </span>
                </button>
                {screenshotUrl?.startsWith("data:") && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={screenshotUrl}
                      alt="Payment screenshot preview"
                      className="rounded-lg object-cover border border-border"
                      style={{ maxHeight: "80px" }}
                    />
                    <span className="text-xs text-green-400 font-medium">
                      Screenshot selected ✓
                    </span>
                  </div>
                )}
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
                {loading ? "Submitting..." : "Submit Payment"}
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
            to="/login"
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
