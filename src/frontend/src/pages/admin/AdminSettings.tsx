import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const [upiId, setUpiId] = useState("guccora@upi");
  const [upiName, setUpiName] = useState("PUTTAPALLI RAVITEJA");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 2000);
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
        <div className="bg-card border border-border rounded-xl p-5 card-glow">
          <p className="text-sm font-semibold text-foreground mb-4">
            UPI Payment Settings
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                UPI ID
              </Label>
              <Input
                data-ocid="admin.settings.upi_id_input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Account Name
              </Label>
              <Input
                data-ocid="admin.settings.upi_name_input"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>

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
        >
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
