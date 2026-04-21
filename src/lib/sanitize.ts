import { MAX_ARTICLE_TEXT, MAX_TEXT_INPUT } from "./constants";
import type {
  LinkedInInput,
  ModeInputMap,
  PoemInput,
  StoryInput,
  UploadedArticle
} from "./types";

function stripControlChars(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function sanitizeText(value: string, maxLength = MAX_TEXT_INPUT) {
  return stripControlChars(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptional(value?: string, maxLength = MAX_TEXT_INPUT) {
  return sanitizeText(value ?? "", maxLength);
}

export function sanitizeArticle(article: UploadedArticle): UploadedArticle {
  return {
    ...article,
    name: sanitizeText(article.name, 120),
    text: sanitizeText(article.text, MAX_ARTICLE_TEXT)
  };
}

export function sanitizePoemInput(input: PoemInput): PoemInput {
  return {
    keywordsOrTheme: sanitizeText(input.keywordsOrTheme),
    poemStyle: sanitizeText(input.poemStyle, 120),
    tone: sanitizeText(input.tone, 120),
    length: sanitizeOptional(input.length, 80),
    pointOfView: sanitizeOptional(input.pointOfView, 120),
    audience: sanitizeOptional(input.audience, 160)
  };
}

export function sanitizeStoryInput(input: StoryInput): StoryInput {
  return {
    premise: sanitizeText(input.premise),
    genreThemes: sanitizeText(input.genreThemes, 200),
    authorVoice: sanitizeText(input.authorVoice, 200),
    tone: sanitizeText(input.tone, 120),
    protagonistDetails: sanitizeOptional(input.protagonistDetails, 500),
    setting: sanitizeOptional(input.setting, 240),
    wordCountTarget: sanitizeOptional(input.wordCountTarget, 20),
    endingType: sanitizeOptional(input.endingType, 120)
  };
}

export function sanitizeLinkedInInput(input: LinkedInInput): LinkedInInput {
  return {
    ownAngle: sanitizeText(input.ownAngle, 1_500),
    targetAudience: sanitizeText(input.targetAudience, 160),
    postGoal: sanitizeText(input.postGoal, 160),
    tone: sanitizeText(input.tone, 120),
    cta: sanitizeOptional(input.cta, 160),
    desiredLength: sanitizeOptional(input.desiredLength, 80),
    articles: input.articles.map(sanitizeArticle)
  };
}

export function sanitizeModeInput<TMode extends keyof ModeInputMap>(
  mode: TMode,
  input: ModeInputMap[TMode]
) {
  if (mode === "poem") {
    return sanitizePoemInput(input as PoemInput) as ModeInputMap[TMode];
  }

  if (mode === "story") {
    return sanitizeStoryInput(input as StoryInput) as ModeInputMap[TMode];
  }

  return sanitizeLinkedInInput(input as LinkedInInput) as ModeInputMap[TMode];
}
