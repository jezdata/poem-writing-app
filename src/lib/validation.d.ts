import type { CreativeMode, CreativeRequest, LinkedInInput, ModeInputMap, PoemInput, StoryInput, ValidationResult } from "./types";
export declare function validatePoemInput(input: PoemInput): ValidationResult<PoemInput>;
export declare function validateStoryInput(input: StoryInput): ValidationResult<StoryInput>;
export declare function validateLinkedInInput(input: LinkedInInput): ValidationResult<LinkedInInput>;
export declare function validateModeInput<TMode extends CreativeMode>(mode: TMode, input: ModeInputMap[TMode]): ValidationResult<ModeInputMap[TMode]>;
export declare function validateCreativeRequest(payload: CreativeRequest): ValidationResult<CreativeRequest>;
