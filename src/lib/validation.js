import { MAX_ARTICLE_COUNT, MAX_ARTICLE_TEXT, MAX_TEXT_INPUT, MIN_ARTICLE_TEXT } from "./constants";
import { sanitizeModeInput, sanitizeText } from "./sanitize";
function hasValue(value) {
    return Boolean(value && value.trim().length > 0);
}
function validateCommonLength(value, field, fieldErrors) {
    if (value.length >= MAX_TEXT_INPUT) {
        fieldErrors[field] = "This field is too long. Please shorten it a little.";
    }
}
export function validatePoemInput(input) {
    const value = sanitizeModeInput("poem", input);
    const fieldErrors = {};
    if (!hasValue(value.keywordsOrTheme)) {
        fieldErrors.keywordsOrTheme = "Add a theme, image, or a few keywords to guide the poem.";
    }
    if (!hasValue(value.poemStyle)) {
        fieldErrors.poemStyle = "Choose the kind of poem you want.";
    }
    if (!hasValue(value.tone)) {
        fieldErrors.tone = "Tell us the emotional tone you want.";
    }
    validateCommonLength(value.keywordsOrTheme, "keywordsOrTheme", fieldErrors);
    return {
        ok: Object.keys(fieldErrors).length === 0,
        value,
        fieldErrors
    };
}
export function validateStoryInput(input) {
    const value = sanitizeModeInput("story", input);
    const fieldErrors = {};
    if (!hasValue(value.premise)) {
        fieldErrors.premise = "Start with a core idea or premise for the story.";
    }
    if (!hasValue(value.genreThemes)) {
        fieldErrors.genreThemes = "Add at least one genre or theme.";
    }
    if (!hasValue(value.authorVoice)) {
        fieldErrors.authorVoice = "Describe the voice you want in broad traits.";
    }
    if (!hasValue(value.tone)) {
        fieldErrors.tone = "Pick a tone so the story lands the right way.";
    }
    if (value.wordCountTarget && !/^\d{2,4}$/.test(value.wordCountTarget)) {
        fieldErrors.wordCountTarget = "Use a simple word count like 500 or 1200.";
    }
    validateCommonLength(value.premise, "premise", fieldErrors);
    return {
        ok: Object.keys(fieldErrors).length === 0,
        value,
        fieldErrors
    };
}
export function validateLinkedInInput(input) {
    const value = sanitizeModeInput("linkedin", input);
    const fieldErrors = {};
    if (!hasValue(value.ownAngle)) {
        fieldErrors.ownAngle = "Add your point of view so the post sounds like you.";
    }
    if (!hasValue(value.targetAudience)) {
        fieldErrors.targetAudience = "Who should this post speak to?";
    }
    if (!hasValue(value.postGoal)) {
        fieldErrors.postGoal = "What should this post accomplish?";
    }
    if (!hasValue(value.tone)) {
        fieldErrors.tone = "Choose the tone for the final post.";
    }
    if (value.articles.length === 0) {
        fieldErrors.articles = "Upload at least one article to synthesize.";
    }
    if (value.articles.length > MAX_ARTICLE_COUNT) {
        fieldErrors.articles = `Upload up to ${MAX_ARTICLE_COUNT} articles at a time.`;
    }
    const tooShort = value.articles.find((article) => article.text.length < MIN_ARTICLE_TEXT);
    if (tooShort) {
        fieldErrors.articles = `"${tooShort.name}" does not contain enough readable text yet.`;
    }
    const tooLong = value.articles.find((article) => article.text.length >= MAX_ARTICLE_TEXT);
    if (tooLong) {
        fieldErrors.articles = `"${tooLong.name}" is too large. Please trim it or upload a shorter text version.`;
    }
    return {
        ok: Object.keys(fieldErrors).length === 0,
        value,
        fieldErrors
    };
}
export function validateModeInput(mode, input) {
    if (mode === "poem") {
        return validatePoemInput(input);
    }
    if (mode === "story") {
        return validateStoryInput(input);
    }
    if (mode === "linkedin") {
        return validateLinkedInInput(input);
    }
    return {
        ok: false,
        fieldErrors: {},
        formError: "This writing mode is not supported."
    };
}
export function validateCreativeRequest(payload) {
    if (!payload || typeof payload !== "object") {
        return {
            ok: false,
            fieldErrors: {},
            formError: "The request body is missing or malformed."
        };
    }
    if (!["poem", "story", "linkedin"].includes(payload.mode)) {
        return {
            ok: false,
            fieldErrors: {},
            formError: "This writing mode is not supported."
        };
    }
    if (!["generate", "rewrite"].includes(payload.action)) {
        return {
            ok: false,
            fieldErrors: {},
            formError: "This request action is not supported."
        };
    }
    const validatedInput = validateModeInput(payload.mode, payload.input);
    if (!validatedInput.ok) {
        return {
            ok: false,
            fieldErrors: validatedInput.fieldErrors,
            formError: validatedInput.formError
        };
    }
    const previousOutput = sanitizeText(payload.previousOutput ?? "", 12000);
    if (payload.action === "rewrite" && !previousOutput) {
        return {
            ok: false,
            fieldErrors: {},
            formError: "There is no generated text to rewrite yet."
        };
    }
    return {
        ok: true,
        value: {
            ...payload,
            input: validatedInput.value,
            previousOutput
        },
        fieldErrors: {}
    };
}
