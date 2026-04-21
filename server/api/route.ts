import type { IncomingMessage, ServerResponse } from "node:http";
import { validateCreativeRequest } from "../../src/lib/validation";
import type { CreativeApiResponse, CreativeRequest } from "../../src/lib/types";
import { generateDemoResponse } from "./demo";
import { generateWithOpenAI } from "./openai";
import { ApiError } from "./types";

function sendJson(res: ServerResponse, status: number, body: CreativeApiResponse) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    throw new ApiError("The request body was empty.", {
      code: "empty_body",
      status: 400
    });
  }

  try {
    return JSON.parse(raw) as CreativeRequest;
  } catch {
    throw new ApiError("The request body could not be parsed.", {
      code: "invalid_json",
      status: 400
    });
  }
}

export async function handleCreativeRoute(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, {
      ok: false,
      error: {
        code: "method_not_allowed",
        message: "Use POST for this endpoint.",
        retryable: false
      }
    });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const validation = validateCreativeRequest(body);

    if (!validation.ok || !validation.value) {
      throw new ApiError(
        validation.formError ?? "Please check your inputs and try again.",
        {
          code: "validation_error",
          status: 400,
          fieldErrors: validation.fieldErrors as Record<string, string>
        }
      );
    }

    const useDemoMode = !process.env.OPENAI_API_KEY && process.env.DISABLE_DEMO_MODE !== "true";
    const data = useDemoMode
      ? generateDemoResponse(validation.value)
      : await generateWithOpenAI(validation.value);

    sendJson(res, 200, {
      ok: true,
      data
    });
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError("Something unexpected happened on the server.", {
            code: "unexpected_server_error",
            status: 500
          });

    console.error("Creative API error", {
      code: apiError.code,
      message: apiError.message,
      stack: apiError.stack
    });

    sendJson(res, apiError.status, {
      ok: false,
      error: {
        code: apiError.code,
        message:
          apiError.code === "missing_environment"
            ? "The server is not configured yet. Add the required environment variables and try again."
            : apiError.message,
        retryable: apiError.retryable,
        fieldErrors: apiError.fieldErrors
      }
    });
  }
}
