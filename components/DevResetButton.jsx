"use client";

import { useState } from "react";
import { resetUserIndustry } from "@/actions/user";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DevResetButton() {
  const [loading, setLoading] = useState(false);

  // Still strictly for development/testing
  if (process.env.NODE_ENV !== "development") return null;

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetUserIndustry();
      toast.success("Industry reset successful. Redirecting...");
      // Small delay for UX
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error("Failed to reset industry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={loading}
      className="
        group
        bg-red-500/5 
        border-red-500/20 
        text-red-400/80
        hover:bg-red-500/10 
        hover:border-red-500/40 
        hover:text-red-400
        transition-all
        duration-300
        backdrop-blur-sm
        flex items-center gap-2
        font-light tracking-wide
        h-9
      "
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
      )}
      <span>Reset Industry</span>
    </Button>
  );
}
