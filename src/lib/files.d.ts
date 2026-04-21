import type { UploadedArticle } from "./types";
export declare function extractArticles(files: FileList | null): Promise<{
    articles: UploadedArticle[];
    error: string;
}>;
