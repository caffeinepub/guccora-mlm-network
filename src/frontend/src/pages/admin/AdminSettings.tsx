import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  CreditCard,
  Loader2,
  QrCode,
  Settings,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAdminSettings,
  useAdminUpdateSettings,
} from "../../hooks/useQueries";

const STORAGE_KEY = "guccora_payment_settings";
const COMPANY_SETTINGS_KEY = "guccora_company_settings";

export interface PaymentSettings {
  upiId: string;
  upiName: string;
  activationAmount: string;
  qrCodeDataUrl: string;
}

export interface CompanySettings {
  companyName: string;
  supportNumber: string;
}

export function getPaymentSettings(): PaymentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PaymentSettings;
  } catch {}
  return {
    upiId: "guccora@upi",
    upiName: "PUTTAPALLI RAVITEJA",
    activationAmount: "599",
    qrCodeDataUrl: "",
  };
}

export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as CompanySettings;
  } catch {}
  return {
    companyName: "Guccora Network",
    supportNumber: "",
  };
}

export function AdminSettingsPage() {
  const { data: backendSettings } = useAdminSettings();
  const updateSettings = useAdminUpdateSettings();

  const [upiId, setUpiId] = useState("guccora@upi");
  const [upiName, setUpiName] = useState("PUTTAPALLI RAVITEJA");
  const [activationAmount, setActivationAmount] = useState("599");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [qrFileName, setQrFileName] = useState("");
  const [companyName, setCompanyName] = useState("Guccora Network");
  const [supportNumber, setSupportNumber] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from backend settings if available, otherwise fall back to localStorage
  useEffect(() => {
    if (backendSettings) {
      setUpiId(backendSettings.upiId || "guccora@upi");
      setUpiName(backendSettings.accountName || "PUTTAPALLI RAVITEJA");
      setActivationAmount(
        backendSettings.activationAmount
          ? backendSettings.activationAmount.toString()
          : "599",
      );
      setQrCodeDataUrl(backendSettings.qrCodeUrl || "");
      setCompanyName(backendSettings.companyName || "Guccora Network");
      setSupportNumber(backendSettings.supportNumber || "");
    } else {
      const s = getPaymentSettings();
      setUpiId(s.upiId);
      setUpiName(s.upiName);
      setActivationAmount(s.activationAmount);
      setQrCodeDataUrl(s.qrCodeDataUrl);
      const c = getCompanySettings();
      setCompanyName(c.companyName);
      setSupportNumber(c.supportNumber);
    }
  }, [backendSettings]);

  const handleQrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setQrCodeDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Save to localStorage for legacy payment page compatibility
    const paymentSettings: PaymentSettings = {
      upiId,
      upiName,
      activationAmount,
      qrCodeDataUrl,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentSettings));
    const companySettings: CompanySettings = {
      companyName,
      supportNumber,
    };
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(companySettings));

    // Also persist to backend if available
    try {
      await updateSettings.mutateAsync({
        upiId,
        accountName: upiName,
        activationAmount: Number(activationAmount) || 599,
        qrCodeUrl: qrCodeDataUrl,
        companyName,
        supportNumber,
      });
    } catch {
      // Backend update failed but localStorage is saved — non-fatal
    }

    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h1>
      </div>

      <div className="space-y-5">
        {/* Company Settings */}
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Company Settings
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Company Name
              </Label>
              <Input
                data-ocid="admin.settings.company_name_input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Guccora Network"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Support Number
              </Label>
              <Input
                data-ocid="admin.settings.support_number_input"
                value={supportNumber}
                onChange={(e) => setSupportNumber(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Payment Settings
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                UPI ID
              </Label>
              <Input
                data-ocid="admin.settings.upi_id_input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. guccora@upi"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Account Holder Name
              </Label>
              <Input
                data-ocid="admin.settings.upi_name_input"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="Account holder name"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Activation Amount (₹)
              </Label>
              <Input
                data-ocid="admin.settings.activation_amount_input"
                value={activationAmount}
                onChange={(e) =>
                  setActivationAmount(e.target.value.replace(/\D/g, ""))
                }
                placeholder="e.g. 599"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* QR Code Upload */}
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">UPI QR Code</p>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Upload the QR code image. It will appear instantly on the user
            payment page.
          </p>

          {qrCodeDataUrl ? (
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-2 rounded-xl border-2 border-yellow-400/40 mb-2">
                <img
                  src={qrCodeDataUrl}
                  alt="Current QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <p className="text-xs text-green-400 font-medium">
                QR code loaded ✓
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-2 rounded-xl border-2 border-yellow-400/40 mb-2">
                <img
                  src="/assets/uploads/file_0000000094f0720b8ff4d7624cf158b4-1.png"
                  alt="Default QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current default QR code
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleQrFileSelect}
          />
          <button
            type="button"
            data-ocid="admin.settings.qr_upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed border-border bg-accent/20 hover:border-primary/60 hover:bg-accent/40 transition-all text-left"
          >
            <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              {qrFileName ? qrFileName : "Click to upload new QR code image"}
            </span>
          </button>
        </div>

        {/* Admin Credentials */}
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <p className="text-sm font-semibold text-foreground mb-4">
            Admin Credentials
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Username</span>
              <span className="text-foreground font-medium">admin</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Password</span>
              <span className="text-foreground font-medium">••••••••••</span>
            </div>
          </div>
        </div>

        {/* MLM Plans */}
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <p className="text-sm font-semibold text-foreground mb-4">
            MLM Plans
          </p>
          <div className="space-y-2 text-sm">
            {[
              { name: "Starter", price: "₹599" },
              { name: "Growth", price: "₹999" },
              { name: "Premium", price: "₹1999" },
            ].map((plan) => (
              <div key={plan.name} className="flex justify-between">
                <span className="text-muted-foreground">{plan.name} Plan</span>
                <span className="text-primary font-semibold">{plan.price}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          data-ocid="admin.settings.save_button"
          className="w-full gold-gradient text-primary-foreground font-semibold h-11 rounded-xl"
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
