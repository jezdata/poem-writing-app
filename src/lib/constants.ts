import type { CreativeFormState, CreativeMode, RewriteOption } from "./types";

export const MAX_TEXT_INPUT = 4_000;
export const MAX_ARTICLE_TEXT = 20_000;
export const MIN_ARTICLE_TEXT = 280;
export const MAX_ARTICLE_COUNT = 5;

export const MODE_LABELS: Record<CreativeMode, string> = {
  poem: "Poem",
  story: "Short Story",
  linkedin: "LinkedIn Post"
};

export const REWRITE_LABELS: Record<RewriteOption, string> = {
  shorter: "Make shorter",
  stronger: "Make stronger",
  warmer: "Make warmer",
  professional: "Make more professional"
};

export const DEFAULT_FORM_STATE: CreativeFormState = {
  poem: {
    keywordsOrTheme: "",
    poemStyle: "Lyrical free verse",
    tone: "Reflective",
    length: "Medium",
    pointOfView: "",
    audience: ""
  },
  story: {
    premise: "",
    genreThemes: "Literary fiction with a touch of hope",
    authorVoice: "Elegant, observant, emotionally grounded",
    tone: "Warm but bittersweet",
    protagonistDetails: "",
    setting: "",
    wordCountTarget: "700",
    endingType: "Quietly hopeful"
  },
  linkedin: {
    ownAngle: "",
    targetAudience: "Founders and marketing leaders",
    postGoal: "Share a practical insight",
    tone: "Thoughtful and credible",
    cta: "",
    desiredLength: "Medium",
    articles: []
  }
};

export const ACCEPTED_UPLOAD_TYPES = [
  "text/plain",
  "text/markdown",
  "text/html",
  "application/xhtml+xml"
];

export const ACCEPTED_UPLOAD_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm"];
