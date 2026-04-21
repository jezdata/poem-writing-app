import type { CreativeRequest, LinkedInInput, PoemInput, StoryInput } from "./types";
interface PromptParts {
    system: string;
    user: string;
}
export declare function buildPoemPrompt(input: PoemInput): PromptParts;
export declare function buildStoryPrompt(input: StoryInput): PromptParts;
export declare function buildLinkedInPrompt(input: LinkedInInput): PromptParts;
export declare function buildRewritePrompt(payload: CreativeRequest): PromptParts;
export declare function buildPrompt(payload: CreativeRequest): PromptParts;
export {};
