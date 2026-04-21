import { Copy, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REWRITE_LABELS } from "@/lib/constants";
import type { RewriteOption } from "@/lib/types";

interface OutputPanelProps {
  title: string;
  content: string;
  sourceLabel?: string;
  isBusy: boolean;
  error: string;
  notices: string[];
  onCopy: () => void;
  onRegenerate: () => void;
  onRewrite: (rewrite: RewriteOption) => void;
}

export function OutputPanel({
  title,
  content,
  sourceLabel,
  isBusy,
  error,
  notices,
  onCopy,
  onRegenerate,
  onRewrite
}: OutputPanelProps) {
  const hasOutput = Boolean(content.trim());

  return (
    <Card className="h-full rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {sourceLabel ?? "Generated writing appears here when you are ready."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCopy} disabled={!hasOutput || isBusy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="secondary" onClick={onRegenerate} disabled={isBusy || !hasOutput}>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(REWRITE_LABELS) as RewriteOption[]).map((rewrite) => (
            <Button
              key={rewrite}
              variant="ghost"
              onClick={() => onRewrite(rewrite)}
              disabled={!hasOutput || isBusy}
              className="border border-slate-200 bg-slate-50"
            >
              <Wand2 className="h-4 w-4" />
              {REWRITE_LABELS[rewrite]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {notices.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notices.join(" ")}
          </div>
        ) : null}

        <div className="min-h-[420px] rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-6">
          {isBusy ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
                <p className="text-base font-semibold text-slate-900">Generating your draft</p>
                <p className="mt-2 text-sm text-slate-500">
                  Pulling the inputs together into something clear, original, and mode-aware.
                </p>
              </div>
            </div>
          ) : hasOutput ? (
            <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-slate-800">
              {content}
            </pre>
          ) : (
            <div className="grid h-full place-items-center text-center text-slate-500">
              <div>
                <p className="text-base font-semibold text-slate-700">No draft yet</p>
                <p className="mt-2 max-w-sm text-sm">
                  Fill in the form, press Generate, and your writing will show up here with quick rewrite actions.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
