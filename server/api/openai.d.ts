import type { CreativeRequest, CreativeSuccessResponse } from "../../src/lib/types";
export declare function generateWithOpenAI(payload: CreativeRequest): Promise<CreativeSuccessResponse["data"]>;
