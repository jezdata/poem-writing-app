import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, children }: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      <span className={cn("min-h-[1.25rem] text-sm", error ? "text-rose-600" : "text-transparent")}>
        {error ?? "."}
      </span>
    </label>
  );
}
