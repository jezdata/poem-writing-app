export const MODES = ["poem", "story", "linkedin"] as const;

export type CreativeMode = (typeof MODES)[number];

export type RewriteOption =
  | "shorter"
  | "stronger"
  | "warmer"
  | "professional";

export interface UploadedArticle {
  id: string;
  name: string;
  text: string;
  mimeType: string;
  size: number;
}

export interface PoemInput {
  keywordsOrTheme: string;
  poemStyle: string;
  tone: string;
  length?: string;
  pointOfView?: string;
  audience?: string;
}

export interface StoryInput {
  premise: string;
  genreThemes: string;
  authorVoice: string;
  tone: string;
  protagonistDetails?: string;
  setting?: string;
  wordCountTarget?: string;
  endingType?: string;
}

export interface LinkedInInput {
  ownAngle: string;
  targetAudience: string;
  postGoal: string;
  tone: string;
  cta?: string;
  desiredLength?: string;
  articles: UploadedArticle[];
}

export interface CreativeFormState {
  poem: PoemInput;
  story: StoryInput;
  linkedin: LinkedInInput;
}

export type ModeInputMap = {
  poem: PoemInput;
  story: StoryInput;
  linkedin: LinkedInInput;
};

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  fieldErrors: Partial<Record<string, string>>;
  formError?: string;
}

export interface CreativeRequest<TMode extends CreativeMode = CreativeMode> {
  mode: TMode;
  action: "generate" | "rewrite";
  input: ModeInputMap[TMode];
  previousOutput?: string;
  rewriteInstruction?: RewriteOption;
}

export interface CreativeSuccessResponse {
  ok: true;
  data: {
    mode: CreativeMode;
    action: "generate" | "rewrite";
    content: string;
    title: string;
    source: "openai" | "demo";
    notices: string[];
  };
}

export interface CreativeErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    fieldErrors?: Partial<Record<string, string>>;
  };
}

export type CreativeApiResponse = CreativeSuccessResponse | CreativeErrorResponse;
