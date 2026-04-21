import { MODE_LABELS, REWRITE_LABELS } from "./constants";
const styleSafetyRule = "Never imitate a living author or reproduce copyrighted passages. Instead, follow high-level traits like pace, texture, emotional temperature, structure, and clarity.";
const qualityRule = "Favor specificity over cliche, vary sentence rhythm, and keep the writing original, coherent, and mode-appropriate.";
function optionalLine(label, value) {
    return value?.trim() ? `${label}: ${value.trim()}` : undefined;
}
export function buildPoemPrompt(input) {
    return {
        system: [
            "You are a gifted creative writing assistant.",
            styleSafetyRule,
            qualityRule,
            "Write poetry with vivid imagery, clean emotional logic, and memorable phrasing."
        ].join(" "),
        user: [
            "Write one original poem.",
            `Theme or keywords: ${input.keywordsOrTheme}`,
            `Poem style: ${input.poemStyle}`,
            `Tone: ${input.tone}`,
            optionalLine("Length", input.length),
            optionalLine("Point of view", input.pointOfView),
            optionalLine("Audience", input.audience),
            "Return only the poem, with a short title on the first line if it fits naturally."
        ]
            .filter(Boolean)
            .join("\n")
    };
}
export function buildStoryPrompt(input) {
    return {
        system: [
            "You are a strong short story writer.",
            styleSafetyRule,
            qualityRule,
            "Create stories that feel complete, emotionally satisfying, and surprising in small human ways."
        ].join(" "),
        user: [
            "Write one original short story.",
            `Core idea or premise: ${input.premise}`,
            `Genre or themes: ${input.genreThemes}`,
            `Desired voice traits: ${input.authorVoice}`,
            `Tone: ${input.tone}`,
            optionalLine("Protagonist details", input.protagonistDetails),
            optionalLine("Setting", input.setting),
            optionalLine("Word count target", input.wordCountTarget),
            optionalLine("Ending type", input.endingType),
            "Do not mention that you were given instructions. Return only the story."
        ]
            .filter(Boolean)
            .join("\n")
    };
}
function buildArticleSummaryBlock(input) {
    return input.articles
        .map((article, index) => {
        const preview = article.text.slice(0, 4500);
        return `Article ${index + 1}: ${article.name}\n${preview}`;
    })
        .join("\n\n---\n\n");
}
export function buildLinkedInPrompt(input) {
    return {
        system: [
            "You are an expert ghostwriter for thoughtful LinkedIn posts.",
            styleSafetyRule,
            qualityRule,
            "Synthesize source material into an original post. Do not copy long phrases from sources, and do not mention plagiarism policies."
        ].join(" "),
        user: [
            "Write one polished LinkedIn post based on the uploaded article text and the user's own angle.",
            `User angle: ${input.ownAngle}`,
            `Target audience: ${input.targetAudience}`,
            `Post goal: ${input.postGoal}`,
            `Tone: ${input.tone}`,
            optionalLine("CTA", input.cta),
            optionalLine("Desired length", input.desiredLength),
            "Use the articles below as source material to transform and synthesize, not to copy:",
            buildArticleSummaryBlock(input),
            "Return only the LinkedIn post."
        ]
            .filter(Boolean)
            .join("\n\n")
    };
}
export function buildRewritePrompt(payload) {
    const modeLabel = MODE_LABELS[payload.mode];
    const rewriteLabel = REWRITE_LABELS[payload.rewriteInstruction ?? "stronger"];
    return {
        system: [
            "You are revising an existing draft for clarity, energy, and originality.",
            styleSafetyRule,
            qualityRule,
            "Preserve the writer's intent while improving the requested dimension."
        ].join(" "),
        user: [
            `Revise the following ${modeLabel.toLowerCase()}.`,
            `Rewrite goal: ${rewriteLabel}.`,
            `Original draft:\n${payload.previousOutput ?? ""}`,
            "Return only the rewritten draft."
        ].join("\n\n")
    };
}
export function buildPrompt(payload) {
    if (payload.action === "rewrite") {
        return buildRewritePrompt(payload);
    }
    switch (payload.mode) {
        case "poem":
            return buildPoemPrompt(payload.input);
        case "story":
            return buildStoryPrompt(payload.input);
        case "linkedin":
            return buildLinkedInPrompt(payload.input);
        default:
            throw new Error("Unsupported mode during prompt construction.");
    }
}
