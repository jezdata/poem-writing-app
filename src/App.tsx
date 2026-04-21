import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles, Upload } from "lucide-react";
import { FormField } from "@/components/app/FormField";
import { ModeTabs } from "@/components/app/ModeTabs";
import { OutputPanel } from "@/components/app/OutputPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_FORM_STATE,
  MODE_LABELS
} from "@/lib/constants";
import { buildGeneratePayload, buildRewritePayload, sendCreativeRequest } from "@/lib/api";
import { extractArticles } from "@/lib/files";
import { buildPrompt } from "@/lib/prompts";
import { validateModeInput } from "@/lib/validation";
import type {
  CreativeMode,
  CreativeRequest,
  CreativeSuccessResponse,
  ModeInputMap,
  RewriteOption
} from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Partial<Record<string, string>>;

function App() {
  const [mode, setMode] = useState<CreativeMode>("poem");
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [output, setOutput] = useState("");
  const [outputTitle, setOutputTitle] = useState("Your draft");
  const [notices, setNotices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<CreativeRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const currentInput = formState[mode];
  const promptPreview = useMemo(() => {
    try {
      const fullPrompt = buildPrompt(
        buildGeneratePayload(mode, currentInput as ModeInputMap[typeof mode])
      ).user;
      return fullPrompt.length > 560 ? `${fullPrompt.slice(0, 560)}...` : fullPrompt;
    } catch {
      return "Add a few inputs to see the request preview.";
    }
  }, [currentInput, mode]);

  const sourceLabel = notices.includes("Demo mode is active because OPENAI_API_KEY is not configured.")
    ? "Generated using the built-in demo writer"
    : "Generated with the backend writing service";

  async function handleSubmit(payload: CreativeRequest) {
    setIsLoading(true);
    setFormError("");
    setCopied(false);

    try {
      const response = await sendCreativeRequest(payload);
      applySuccess(response);
      setLastRequest(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected request failure.";
      const typedError = error as Error & { fieldErrors?: Record<string, string> };
      if (typedError.fieldErrors) {
        setFieldErrors(typedError.fieldErrors);
      }
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function applySuccess(response: CreativeSuccessResponse["data"]) {
    setOutput(response.content);
    setOutputTitle(response.title);
    setNotices(response.notices);
    setFieldErrors({});
    setFormError("");
  }

  function updateModeInput<TMode extends CreativeMode, TKey extends keyof ModeInputMap[TMode]>(
    targetMode: TMode,
    key: TKey,
    value: ModeInputMap[TMode][TKey]
  ) {
    setFormState((current) => ({
      ...current,
      [targetMode]: {
        ...current[targetMode],
        [key]: value
      }
    }));

    setFieldErrors((current) => ({
      ...current,
      [String(key)]: ""
    }));
  }

  async function generateCurrentMode() {
    const validation = validateModeInput(mode, currentInput as ModeInputMap[typeof mode]);

    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.formError ?? "Please fix the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    await handleSubmit(buildGeneratePayload(mode, validation.value as ModeInputMap[typeof mode]));
  }

  async function rewriteOutput(rewriteInstruction: RewriteOption) {
    if (!output.trim()) {
      setFormError("Generate a draft first, then you can refine it with rewrite actions.");
      return;
    }

    const validation = validateModeInput(mode, currentInput as ModeInputMap[typeof mode]);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setFormError("Please fix the form before rewriting the current draft.");
      return;
    }

    await handleSubmit(
      buildRewritePayload(
        mode,
        validation.value as ModeInputMap[typeof mode],
        output,
        rewriteInstruction
      )
    );
  }

  async function handleCopy() {
    if (!output.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed", error);
      setFormError("Copy did not work in this browser. You can still select and copy the text manually.");
    }
  }

  async function handleArticleUpload(files: FileList | null) {
    const result = await extractArticles(files);

    if (result.error) {
      setFieldErrors((current) => ({ ...current, articles: result.error }));
      setFormError(result.error);
      return;
    }

    updateModeInput("linkedin", "articles", result.articles);
    setFormError("");
  }

  function renderPoemFields() {
    return (
      <>
        <FormField
          label="Keywords or theme"
          hint="Required"
          error={fieldErrors.keywordsOrTheme}
        >
          <Textarea
            value={formState.poem.keywordsOrTheme}
            onChange={(event) =>
              updateModeInput("poem", "keywordsOrTheme", event.target.value)
            }
            rows={4}
            placeholder="Blue hour on the coast, regret, second chances, and the smell of rain"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Poem style" hint="Required" error={fieldErrors.poemStyle}>
            <Input
              value={formState.poem.poemStyle}
              onChange={(event) => updateModeInput("poem", "poemStyle", event.target.value)}
              placeholder="Lyrical free verse"
            />
          </FormField>

          <FormField label="Tone" hint="Required" error={fieldErrors.tone}>
            <Input
              value={formState.poem.tone}
              onChange={(event) => updateModeInput("poem", "tone", event.target.value)}
              placeholder="Reflective, urgent, quietly hopeful"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Length" error={fieldErrors.length}>
            <Input
              value={formState.poem.length}
              onChange={(event) => updateModeInput("poem", "length", event.target.value)}
              placeholder="Short, medium, long"
            />
          </FormField>

          <FormField label="Point of view" error={fieldErrors.pointOfView}>
            <Input
              value={formState.poem.pointOfView}
              onChange={(event) => updateModeInput("poem", "pointOfView", event.target.value)}
              placeholder="First person"
            />
          </FormField>

          <FormField label="Audience" error={fieldErrors.audience}>
            <Input
              value={formState.poem.audience}
              onChange={(event) => updateModeInput("poem", "audience", event.target.value)}
              placeholder="Someone grieving, a classroom, general readers"
            />
          </FormField>
        </div>
      </>
    );
  }

  function renderStoryFields() {
    return (
      <>
        <FormField label="Core idea or premise" hint="Required" error={fieldErrors.premise}>
          <Textarea
            value={formState.story.premise}
            onChange={(event) => updateModeInput("story", "premise", event.target.value)}
            rows={4}
            placeholder="A night janitor finds handwritten apologies hidden inside library books."
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Genre or theme(s)" hint="Required" error={fieldErrors.genreThemes}>
            <Input
              value={formState.story.genreThemes}
              onChange={(event) => updateModeInput("story", "genreThemes", event.target.value)}
              placeholder="Magical realism, family, memory"
            />
          </FormField>

          <FormField label="Author voice" hint="Required" error={fieldErrors.authorVoice}>
            <Input
              value={formState.story.authorVoice}
              onChange={(event) => updateModeInput("story", "authorVoice", event.target.value)}
              placeholder="Observant, elegant, emotionally direct"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tone" hint="Required" error={fieldErrors.tone}>
            <Input
              value={formState.story.tone}
              onChange={(event) => updateModeInput("story", "tone", event.target.value)}
              placeholder="Tender with small flashes of humor"
            />
          </FormField>

          <FormField label="Setting" error={fieldErrors.setting}>
            <Input
              value={formState.story.setting}
              onChange={(event) => updateModeInput("story", "setting", event.target.value)}
              placeholder="An old public library in winter"
            />
          </FormField>
        </div>

        <FormField label="Protagonist details" error={fieldErrors.protagonistDetails}>
          <Textarea
            value={formState.story.protagonistDetails}
            onChange={(event) =>
              updateModeInput("story", "protagonistDetails", event.target.value)
            }
            rows={3}
            placeholder="Age, fears, contradiction, what they want, what they avoid"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Word count target" error={fieldErrors.wordCountTarget}>
            <Input
              value={formState.story.wordCountTarget}
              onChange={(event) => updateModeInput("story", "wordCountTarget", event.target.value)}
              placeholder="700"
            />
          </FormField>

          <FormField label="Ending type" error={fieldErrors.endingType}>
            <Input
              value={formState.story.endingType}
              onChange={(event) => updateModeInput("story", "endingType", event.target.value)}
              placeholder="Bittersweet but earned"
            />
          </FormField>
        </div>
      </>
    );
  }

  function renderLinkedInFields() {
    return (
      <>
        <FormField label="Upload articles" hint="Required" error={fieldErrors.articles}>
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-4">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
              <Upload className="h-4 w-4" />
              <span>Upload .txt, .md, or .html article files</span>
              <input
                type="file"
                accept=".txt,.md,.markdown,.html,.htm,text/plain,text/markdown,text/html"
                multiple
                className="hidden"
                onChange={(event) => void handleArticleUpload(event.target.files)}
              />
            </label>

            {formState.linkedin.articles.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {formState.linkedin.articles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{article.name}</p>
                        <p className="text-xs text-slate-500">
                          {article.text.length} readable characters extracted
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateModeInput(
                            "linkedin",
                            "articles",
                            formState.linkedin.articles.filter((item) => item.id !== article.id)
                          )
                        }
                        className="text-sm font-medium text-slate-500 hover:text-slate-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </FormField>

        <FormField label="Your angle" hint="Required" error={fieldErrors.ownAngle}>
          <Textarea
            value={formState.linkedin.ownAngle}
            onChange={(event) => updateModeInput("linkedin", "ownAngle", event.target.value)}
            rows={4}
            placeholder="I want to connect these articles to the trust gap I see between AI product teams and end users."
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Target audience" hint="Required" error={fieldErrors.targetAudience}>
            <Input
              value={formState.linkedin.targetAudience}
              onChange={(event) =>
                updateModeInput("linkedin", "targetAudience", event.target.value)
              }
              placeholder="Product leaders, consultants, founders"
            />
          </FormField>

          <FormField label="Post goal" hint="Required" error={fieldErrors.postGoal}>
            <Input
              value={formState.linkedin.postGoal}
              onChange={(event) => updateModeInput("linkedin", "postGoal", event.target.value)}
              placeholder="Build authority, spark discussion, drive comments"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Tone" hint="Required" error={fieldErrors.tone}>
            <Input
              value={formState.linkedin.tone}
              onChange={(event) => updateModeInput("linkedin", "tone", event.target.value)}
              placeholder="Warm, credible, concise"
            />
          </FormField>

          <FormField label="CTA" error={fieldErrors.cta}>
            <Input
              value={formState.linkedin.cta}
              onChange={(event) => updateModeInput("linkedin", "cta", event.target.value)}
              placeholder="Ask a question or invite replies"
            />
          </FormField>

          <FormField label="Desired length" error={fieldErrors.desiredLength}>
            <Input
              value={formState.linkedin.desiredLength}
              onChange={(event) =>
                updateModeInput("linkedin", "desiredLength", event.target.value)
              }
              placeholder="Short, medium, detailed"
            />
          </FormField>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_28%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_90px_rgba(148,163,184,0.18)] backdrop-blur"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
                Shortform creative studio
              </span>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-slate-950 sm:text-5xl">
                Write sharper poems, short stories, and LinkedIn posts from one calm workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Switch modes, guide the voice, upload article text for synthesis, and refine the output with one-click rewrites.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/85 px-5 py-4 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Current mode</p>
              <p className="mt-1 text-lg">{MODE_LABELS[mode]}</p>
              <p className="mt-2 max-w-xs text-xs leading-5">
                Validation keeps your inputs intact, and backend errors are translated into plain-language messages.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <Card className="rounded-[32px] border-white/70 bg-white/85 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Create</CardTitle>
                    <p className="mt-2 text-sm text-slate-500">
                      The form adapts to the writing mode you choose and keeps your work in place while you switch.
                    </p>
                  </div>
                  {copied ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Copied
                    </span>
                  ) : null}
                </div>

                <ModeTabs value={mode} onChange={(nextMode) => {
                  setMode(nextMode);
                  setFieldErrors({});
                  setFormError("");
                }} />
              </CardHeader>

              <CardContent className="grid gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="grid gap-4"
                  >
                    {mode === "poem" && renderPoemFields()}
                    {mode === "story" && renderStoryFields()}
                    {mode === "linkedin" && renderLinkedInFields()}
                  </motion.div>
                </AnimatePresence>

                {formError ? (
                  <div className="flex items-start gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Prompt preview</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {promptPreview}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={() => void generateCurrentMode()} disabled={isLoading}>
                    <Sparkles className="h-4 w-4" />
                    {isLoading ? "Generating..." : `Generate ${MODE_LABELS[mode]}`}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFormState(DEFAULT_FORM_STATE);
                      setFieldErrors({});
                      setFormError("");
                      setOutput("");
                      setOutputTitle("Your draft");
                      setNotices([]);
                      setLastRequest(null);
                    }}
                    disabled={isLoading}
                    className="border border-slate-200 bg-white"
                  >
                    Reset form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <OutputPanel
              title={outputTitle}
              content={output}
              sourceLabel={output ? sourceLabel : undefined}
              isBusy={isLoading}
              error=""
              notices={notices}
              onCopy={() => void handleCopy()}
              onRegenerate={() => {
                if (lastRequest) {
                  void handleSubmit(lastRequest);
                } else {
                  void generateCurrentMode();
                }
              }}
              onRewrite={(rewrite) => void rewriteOutput(rewrite)}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
