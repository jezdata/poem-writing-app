import type { CreativeMode, CreativeRequest, ModeInputMap, RewriteOption } from "./types";
export declare function sendCreativeRequest<TMode extends CreativeMode>(payload: CreativeRequest<TMode>): Promise<{
    mode: CreativeMode;
    action: "generate" | "rewrite";
    content: string;
    title: string;
    source: "openai" | "demo";
    notices: string[];
}>;
export declare function buildGeneratePayload<TMode extends CreativeMode>(mode: TMode, input: ModeInputMap[TMode]): CreativeRequest<TMode>;
export declare function buildRewritePayload<TMode extends CreativeMode>(mode: TMode, input: ModeInputMap[TMode], previousOutput: string, rewriteInstruction: RewriteOption): CreativeRequest<TMode>;
