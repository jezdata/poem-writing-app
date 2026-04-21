export async function sendCreativeRequest(payload) {
    const response = await fetch("/api/creative", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    let data;
    try {
        data = (await response.json());
    }
    catch {
        throw new Error("The server returned an unreadable response.");
    }
    if (!response.ok || !data.ok) {
        const message = data.ok === false
            ? data.error.message
            : "Something went wrong while generating your draft.";
        const error = new Error(message);
        if (data.ok === false) {
            error.code = data.error.code;
            error.fieldErrors = data.error.fieldErrors;
        }
        throw error;
    }
    return data.data;
}
export function buildGeneratePayload(mode, input) {
    return {
        mode,
        action: "generate",
        input
    };
}
export function buildRewritePayload(mode, input, previousOutput, rewriteInstruction) {
    return {
        mode,
        action: "rewrite",
        input,
        previousOutput,
        rewriteInstruction
    };
}
