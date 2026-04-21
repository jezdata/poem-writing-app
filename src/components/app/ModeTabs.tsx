import { PenLine, ScrollText, BriefcaseBusiness } from "lucide-react";
import { MODE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CreativeMode } from "@/lib/types";

const MODE_ICONS = {
  poem: PenLine,
  story: ScrollText,
  linkedin: BriefcaseBusiness
};

interface ModeTabsProps {
  value: CreativeMode;
  onChange: (mode: CreativeMode) => void;
}

export function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(["poem", "story", "linkedin"] as const).map((mode) => {
        const Icon = MODE_ICONS[mode];
        const active = mode === value;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "rounded-[24px] border px-4 py-4 text-left transition",
              active
                ? "border-amber-500 bg-amber-50 text-slate-950 shadow-sm"
                : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white"
            )}
          >
            <div className="mb-3 inline-flex rounded-2xl bg-white/80 p-2 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold">{MODE_LABELS[mode]}</div>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "poem" && "Imagery-forward, lyrical, and shaped by feeling."}
              {mode === "story" && "Complete short fiction with tone and structure controls."}
              {mode === "linkedin" && "Thoughtful posts synthesized from source articles and your angle."}
            </p>
          </button>
        );
      })}
    </div>
  );
}
