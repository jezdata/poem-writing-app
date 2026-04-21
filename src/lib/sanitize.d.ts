import type { LinkedInInput, ModeInputMap, PoemInput, StoryInput, UploadedArticle } from "./types";
export declare function sanitizeText(value: string, maxLength?: number): string;
export declare function sanitizeOptional(value?: string, maxLength?: number): string;
export declare function sanitizeArticle(article: UploadedArticle): UploadedArticle;
export declare function sanitizePoemInput(input: PoemInput): PoemInput;
export declare function sanitizeStoryInput(input: StoryInput): StoryInput;
export declare function sanitizeLinkedInInput(input: LinkedInInput): LinkedInInput;
export declare function sanitizeModeInput<TMode extends keyof ModeInputMap>(mode: TMode, input: ModeInputMap[TMode]): ModeInputMap[TMode];
