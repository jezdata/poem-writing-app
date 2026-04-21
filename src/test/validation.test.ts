import { describe, expect, it } from "vitest";
import { buildPrompt } from "@/lib/prompts";
import { validateLinkedInInput, validatePoemInput, validateStoryInput } from "@/lib/validation";
import type { CreativeRequest } from "@/lib/types";

describe("validation", () => {
  it("rejects a poem without a theme", () => {
    const result = validatePoemInput({
      keywordsOrTheme: "",
      poemStyle: "Free verse",
      tone: "Reflective"
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.keywordsOrTheme).toContain("theme");
  });

  it("accepts a valid story request", () => {
    const result = validateStoryInput({
      premise: "A chef inherits a lighthouse and finds recipe cards inside the walls.",
      genreThemes: "Contemporary fiction, grief, family",
      authorVoice: "Elegant and warm",
      tone: "Bittersweet",
      wordCountTarget: "900"
    });

    expect(result.ok).toBe(true);
    expect(result.value?.wordCountTarget).toBe("900");
  });

  it("rejects LinkedIn uploads with too little readable text", () => {
    const result = validateLinkedInInput({
      ownAngle: "Teams need better onboarding for AI systems.",
      targetAudience: "Product teams",
      postGoal: "Spark discussion",
      tone: "Credible",
      articles: [
        {
          id: "a1",
          name: "tiny.txt",
          text: "Too short",
          mimeType: "text/plain",
          size: 8
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.articles).toContain("tiny.txt");
  });
});

describe("prompt building", () => {
  it("builds a LinkedIn prompt that includes the user angle and article text", () => {
    const payload: CreativeRequest<"linkedin"> = {
      mode: "linkedin",
      action: "generate",
      input: {
        ownAngle: "The best AI products explain themselves clearly.",
        targetAudience: "Founders",
        postGoal: "Teach something useful",
        tone: "Thoughtful",
        articles: [
          {
            id: "one",
            name: "source.txt",
            text: "Trust increases when systems explain their steps.",
            mimeType: "text/plain",
            size: 120
          }
        ]
      }
    };

    const prompt = buildPrompt(payload);

    expect(prompt.user).toContain("The best AI products explain themselves clearly.");
    expect(prompt.user).toContain("source.txt");
  });
});
