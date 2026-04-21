import type { CreativeApiResponse, CreativeMode, CreativeRequest, ModeInputMap, RewriteOption } from "./types";

export async function sendCreativeRequest<TMode extends CreativeMode>(
  payload: CreativeRequest<TMode>
) {
  const response = await fetch("/api/creative", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data: CreativeApiResponse;

  try {
    data = (await response.json()) as CreativeApiResponse;
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok || !data.ok) {
    const message =
      data.ok === false
        ? data.error.message
        : "Something went wrong while generating your draft.";

    const error = new Error(message) as Error & {
      code?: string;
      fieldErrors?: Record<string, string>;
    };

    if (data.ok === false) {
      error.code = data.error.code;
      error.fieldErrors = data.error.fieldErrors as Record<string, string> | undefined;
    }

    throw error;
  }

  return data.data;
}

export function buildGeneratePayload<TMode extends CreativeMode>(
  mode: TMode,
  input: ModeInputMap[TMode]
): CreativeRequest<TMode> {
  return {
    mode,
    action: "generate",
    input
  };
}

export function buildRewritePayload<TMode extends CreativeMode>(
  mode: TMode,
  input: ModeInputMap[TMode],
  previousOutput: string,
  rewriteInstruction: RewriteOption
): CreativeRequest<TMode> {
  return {
    mode,
    action: "rewrite",
    input,
    previousOutput,
    rewriteInstruction
  };
}
