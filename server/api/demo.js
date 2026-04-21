import { MODE_LABELS, REWRITE_LABELS } from "../../src/lib/constants";
function createPoem(theme, tone) {
    return `Quiet Flame

${theme} waits where the late light bends,
not asking to be rescued,
only named with enough care
that it stops feeling ordinary.

The room keeps a ${tone.toLowerCase()} hush,
cup rings, window glass, a chair turned slightly off-center,
and still the smallest thing changes everything:
one brave sentence,
spoken softly,
staying.`;
}
function createStory(premise, tone) {
    return `The first apology Marta found was folded into a gardening guide, written on the back of a grocery receipt: I should have stayed when the call came.

By midnight the return cart had given her five more. They lived in atlases, cookbooks, memoirs about grief. Each note was brief, specific, and impossibly tender, as if the library itself had started collecting the words people never managed to say out loud. Marta slipped them into her pocket and kept shelving, the fluorescent lights humming above her like a tired choir.

The next evening she found one addressed to her.

It was tucked inside a book she had checked out twelve years earlier, during the winter she left home without telling her mother where she was going. The note did not accuse. It only said: You were allowed to be afraid, but you were always loved on your way out.

She sat on the rolling ladder until the metal stilled beneath her. Outside, snow feathered the parking lot in ${tone.toLowerCase()} silence. For the first time in years, forgiveness did not feel like a performance. It felt like a room being relit one lamp at a time.

When the morning shift arrived, Marta used the circulation desk phone she usually ignored. Her mother answered on the second ring, wary at first, then laughing, then crying without embarrassment. Marta looked out over the stacks while they talked. The notes, she decided, had never belonged to the library. They belonged to whoever was finally ready to read them.`;
}
function createLinkedIn(angle, audience) {
    return `Most teams don't have an AI problem.

They have a trust problem.

After reading through the source material, one pattern stood out to me: the strongest products are not the ones that add the most intelligence. They are the ones that make people feel oriented, respected, and in control.

That's the lens I keep coming back to: ${angle}

For ${audience.toLowerCase()}, that has a few practical implications:

1. Explain what the system is doing before users have to guess.
2. Let people recover gracefully when the output misses.
3. Design for confidence, not just speed.

The next wave of differentiation may not come from bigger claims.
It may come from calmer, clearer product decisions.

Curious how others are thinking about this in their own teams.`;
}
export function generateDemoResponse(payload) {
    if (payload.action === "rewrite") {
        return {
            mode: payload.mode,
            action: payload.action,
            title: `${MODE_LABELS[payload.mode]} revision`,
            content: `${payload.previousOutput}\n\n[Demo rewrite applied: ${REWRITE_LABELS[payload.rewriteInstruction ?? "stronger"]}]`,
            source: "demo",
            notices: ["Demo mode is active because OPENAI_API_KEY is not configured."]
        };
    }
    if (payload.mode === "poem") {
        const poemInput = payload.input;
        return {
            mode: payload.mode,
            action: payload.action,
            title: "Poem draft",
            content: createPoem(poemInput.keywordsOrTheme, poemInput.tone),
            source: "demo",
            notices: ["Demo mode is active because OPENAI_API_KEY is not configured."]
        };
    }
    if (payload.mode === "story") {
        const storyInput = payload.input;
        return {
            mode: payload.mode,
            action: payload.action,
            title: "Story draft",
            content: createStory(storyInput.premise, storyInput.tone),
            source: "demo",
            notices: ["Demo mode is active because OPENAI_API_KEY is not configured."]
        };
    }
    const linkedinInput = payload.input;
    return {
        mode: payload.mode,
        action: payload.action,
        title: "LinkedIn post draft",
        content: createLinkedIn(linkedinInput.ownAngle, linkedinInput.targetAudience),
        source: "demo",
        notices: ["Demo mode is active because OPENAI_API_KEY is not configured."]
    };
}
