import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency, currencies, CurrencyCode } from "@/contexts/CurrencyContext";
import { Settings2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { currency, setCurrency, formatAmount } = useCurrency();

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    const selected = currencies.find((c) => c.code === code);
    toast.success("Currency updated", {
      description: `Now displaying amounts in ${selected?.name} (${selected?.symbol})`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="mt-1 text-muted-foreground">
                Configure your preferences and display options
              </p>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Currency Display</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Select your preferred currency for displaying monetary values throughout the application.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {currencies.map((curr) => {
                const isSelected = currency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="text-3xl font-bold text-foreground">
                      {curr.symbol}
                    </span>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {curr.code}
                      </p>
                      <p className="text-xs text-muted-foreground">{curr.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Sample Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(445000)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Room Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(215)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">RevPAR</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(182.75)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
