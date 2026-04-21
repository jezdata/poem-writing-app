import { ACCEPTED_UPLOAD_EXTENSIONS, ACCEPTED_UPLOAD_TYPES, MAX_ARTICLE_COUNT } from "./constants";
import { sanitizeText } from "./sanitize";
function isAcceptedFile(file) {
    const lowerName = file.name.toLowerCase();
    return (ACCEPTED_UPLOAD_TYPES.includes(file.type) ||
        ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => lowerName.endsWith(extension)));
}
function stripHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent ?? "";
}
function normalizeFileText(file, rawText) {
    if (file.type === "text/html" || file.name.toLowerCase().endsWith(".html")) {
        return stripHtml(rawText);
    }
    return rawText;
}
export async function extractArticles(files) {
    if (!files || files.length === 0) {
        return { articles: [], error: "" };
    }
    if (files.length > MAX_ARTICLE_COUNT) {
        return {
            articles: [],
            error: `Please upload up to ${MAX_ARTICLE_COUNT} articles at a time.`
        };
    }
    const articles = [];
    for (const file of Array.from(files)) {
        if (!isAcceptedFile(file)) {
            return {
                articles: [],
                error: `"${file.name}" is not a supported file type. Use .txt, .md, or .html.`
            };
        }
        try {
            const rawText = await file.text();
            const text = sanitizeText(normalizeFileText(file, rawText), 20000);
            articles.push({
                id: `${file.name}-${file.size}-${file.lastModified}`,
                name: file.name,
                text,
                mimeType: file.type || "text/plain",
                size: file.size
            });
        }
        catch (error) {
            console.error("File read failed", error);
            return {
                articles: [],
                error: `We couldn't read "${file.name}". Try a simpler text-based export instead.`
            };
        }
    }
    return { articles, error: "" };
}
