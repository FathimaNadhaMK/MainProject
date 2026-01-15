"use client";

import { resetUserIndustry } from "@/actions/user";

export default function DevResetButton() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <button
      onClick={async () => {
        await resetUserIndustry();
        window.location.reload();
      }}
      className="
        px-3 py-1.5
        rounded-md
        text-xs font-medium
        text-red-400
        border border-red-500/30
        bg-red-500/5
        hover:bg-red-500/10
        transition
      "
      title="Reset industry insights (development only)"
    >
      Reset Industry
    </button>
  );
}
