import { buildPrompt } from "../../src/lib/prompts";
import type { CreativeRequest, CreativeSuccessResponse } from "../../src/lib/types";
import { ApiError } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const REQUEST_TIMEOUT_MS = 30_000;

function extractOutputText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const textParts = output.flatMap((item: any) => {
    if (item?.type !== "message" || !Array.isArray(item.content)) {
      return [];
    }

    return item.content
      .filter((content: any) => content?.type === "output_text" && typeof content.text === "string")
      .map((content: any) => content.text.trim());
  });

  return textParts.join("\n").trim();
}

function titleForMode(mode: CreativeRequest["mode"]) {
  switch (mode) {
    case "poem":
      return "Poem draft";
    case "story":
      return "Story draft";
    case "linkedin":
      return "LinkedIn post draft";
  }
}

export async function generateWithOpenAI(
  payload: CreativeRequest
): Promise<CreativeSuccessResponse["data"]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError("OPENAI_API_KEY is missing on the server.", {
      code: "missing_environment",
      status: 500
    });
  }

  const prompt = buildPrompt(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: prompt.system }]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt.user }]
          }
        ],
        max_output_tokens: payload.mode === "linkedin" ? 900 : 1200
      })
    });

    const responseBody: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      const apiMessage =
        responseBody?.error?.message || "The writing service could not complete this request.";

      if (response.status === 429) {
        throw new ApiError(
          "The writing service is receiving too many requests right now. Please try again in a moment.",
          {
            code: "rate_limited",
            status: 429,
            retryable: true
          }
        );
      }

      if (response.status >= 500) {
        throw new ApiError(
          "The writing service had a temporary issue. Please retry in a moment.",
          {
            code: "model_unavailable",
            status: response.status,
            retryable: true
          }
        );
      }

      throw new ApiError(apiMessage, {
        code: "model_error",
        status: response.status
      });
    }

    const content = extractOutputText(responseBody);
    if (!content) {
      throw new ApiError("The writing service returned an unexpected response shape.", {
        code: "malformed_model_response",
        status: 502,
        retryable: true
      });
    }

    return {
      mode: payload.mode,
      action: payload.action,
      title: titleForMode(payload.mode),
      content,
      source: "openai",
      notices: []
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The writing request took too long. Please try again.", {
        code: "api_timeout",
        status: 504,
        retryable: true
      });
    }

    throw new ApiError("We couldn't reach the writing service. Check your connection and try again.", {
      code: "network_failure",
      status: 502,
      retryable: true
    });
  } finally {
    clearTimeout(timeout);
  }
}
