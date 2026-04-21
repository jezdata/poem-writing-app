import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export function Select({
  className,
  onValueChange,
  onChange,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none",
        "focus:border-slate-500 bg-white",
        className
      )}
      onChange={(e) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function SelectValue({
  placeholder
}: {
  placeholder?: string;
}) {
  return <option value="">{placeholder ?? "Select"}</option>;
}

export function SelectContent({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}
