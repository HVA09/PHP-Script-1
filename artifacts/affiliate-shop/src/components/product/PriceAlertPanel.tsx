import { useEffect, useState } from "react";
import { Bell, Check, Loader2, LogIn, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/AuthContext";
import {
  getGetPriceAlertsQueryKey,
  useCreatePriceAlert,
  useDeletePriceAlert,
  useGetPriceAlerts,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface PriceAlertPanelProps {
  productId: number;
  currentPrice: number;
}

export function PriceAlertPanel({ productId, currentPrice }: PriceAlertPanelProps) {
  const { isAuthenticated, login } = useAuthContext();
  const queryClient = useQueryClient();
  const [targetPrice, setTargetPrice] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { data } = useGetPriceAlerts({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetPriceAlertsQueryKey(),
      staleTime: 0,
    },
  });
  const alert = data?.alerts.find((item) => item.productId === productId);

  useEffect(() => {
    setTargetPrice(alert ? alert.targetPrice.toFixed(2) : "");
  }, [alert?.targetPrice]);

  const refreshAlerts = () => {
    void queryClient.invalidateQueries({ queryKey: getGetPriceAlertsQueryKey() });
  };

  const saveAlert = useCreatePriceAlert({
    mutation: {
      onSuccess: () => {
        setMessage("Price alert saved.");
        refreshAlerts();
      },
      onError: () => setMessage("We couldn't save the alert. Please try again."),
    },
  });

  const removeAlert = useDeletePriceAlert({
    mutation: {
      onSuccess: () => {
        setMessage("Price alert removed.");
        setTargetPrice("");
        refreshAlerts();
      },
      onError: () => setMessage("We couldn't remove the alert. Please try again."),
    },
  });

  const handleSave = () => {
    const value = Number(targetPrice);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a target price greater than $0.");
      return;
    }
    setMessage(null);
    saveAlert.mutate({ data: { productId, targetPrice: value } });
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Want this deal at a lower price?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Log in to set a target price and keep track of it across devices.
            </p>
            <Button variant="outline" size="sm" onClick={login} className="mt-3 gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> Log in to set an alert
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSaving = saveAlert.isPending || removeAlert.isPending;
  const hasReachedTarget = alert?.triggered ?? false;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-2 ${hasReachedTarget ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-primary/10 text-primary"}`}>
          {hasReachedTarget ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-sm">Price alert</p>
            {hasReachedTarget && <Badge className="bg-green-600 text-white hover:bg-green-600">Target reached</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasReachedTarget
              ? `This deal is now at or below your target price of $${alert?.targetPrice.toFixed(2)}.`
              : `We'll flag it when the price reaches your target. Current price: $${currentPrice.toFixed(2)}.`}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={targetPrice}
                onChange={(event) => {
                  setTargetPrice(event.target.value);
                  setMessage(null);
                }}
                placeholder="Target price"
                className="pl-7"
                aria-label="Target price"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="sm:min-w-32">
              {saveAlert.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {alert ? "Update alert" : "Set alert"}
            </Button>
            {alert && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeAlert.mutate({ productId })}
                disabled={isSaving}
                aria-label="Remove price alert"
              >
                {removeAlert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {message && (
            <p className={`mt-2 text-xs ${message.includes("couldn't") || message.includes("Enter") ? "text-destructive" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PriceAlertsList() {
  const { isAuthenticated, isLoading, login } = useAuthContext();
  const queryClient = useQueryClient();
  const { data, isLoading: alertsLoading } = useGetPriceAlerts({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetPriceAlertsQueryKey(),
      staleTime: 0,
    },
  });
  const removeAlert = useDeletePriceAlert({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetPriceAlertsQueryKey() });
      },
    },
  });

  if (isLoading || (isAuthenticated && alertsLoading)) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-primary/10" />)}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border bg-card px-6 py-12 text-center">
        <Bell className="mx-auto mb-4 h-10 w-10 text-primary/50" />
        <h2 className="font-display text-xl font-bold">Keep an eye on the price</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Log in to save target prices and see when your favorite deals reach them.
        </p>
        <Button onClick={login} className="mt-5 gap-2"><LogIn className="h-4 w-4" /> Log in</Button>
      </div>
    );
  }

  const alerts = data?.alerts ?? [];
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border bg-card px-6 py-12 text-center">
        <Bell className="mx-auto mb-4 h-10 w-10 text-primary/40" />
        <h2 className="font-display text-xl font-bold">No price alerts yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Open any product and set a target price. Your alerts will appear here.
        </p>
        <Button asChild className="mt-5"><Link href="/products">Browse deals</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
          <Link href={`/products/${alert.productSlug}`} className="flex min-w-0 flex-1 items-center gap-4 group">
            <img src={alert.imageUrl} alt={alert.productTitle} className="h-20 w-20 shrink-0 rounded-xl border object-cover mix-blend-multiply" />
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold group-hover:text-primary transition-colors">{alert.productTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Target <span className="font-semibold text-foreground">${alert.targetPrice.toFixed(2)}</span>
                <span className="mx-1.5">·</span>
                Current <span className="font-semibold text-foreground">${alert.currentPrice.toFixed(2)}</span>
              </p>
              {alert.triggered && <Badge className="mt-2 bg-green-600 text-white hover:bg-green-600">Target reached</Badge>}
            </div>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeAlert.mutate({ productId: alert.productId })}
            disabled={removeAlert.isPending}
            className="gap-1.5 self-end sm:self-center"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      ))}
    </div>
  );
}