import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ACCEPTED_UPLOAD_TYPES,
  MAX_ARTICLE_COUNT
} from "./constants";
import { sanitizeText } from "./sanitize";
import type { UploadedArticle } from "./types";

type BrowserFile = globalThis.File;
type BrowserFileList = globalThis.FileList;

function isAcceptedFile(file: BrowserFile) {
  const lowerName = file.name.toLowerCase();
  return (
    ACCEPTED_UPLOAD_TYPES.includes(file.type) ||
    ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

function stripHtml(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}

function normalizeFileText(file: BrowserFile, rawText: string) {
  if (file.type === "text/html" || file.name.toLowerCase().endsWith(".html")) {
    return stripHtml(rawText);
  }

  return rawText;
}

export async function extractArticles(files: BrowserFileList | null) {
  if (!files || files.length === 0) {
    return { articles: [] as UploadedArticle[], error: "" };
  }

  if (files.length > MAX_ARTICLE_COUNT) {
    return {
      articles: [] as UploadedArticle[],
      error: `Please upload up to ${MAX_ARTICLE_COUNT} articles at a time.`
    };
  }

  const articles: UploadedArticle[] = [];

  for (const file of Array.from(files as ArrayLike<BrowserFile>)) {
    if (!isAcceptedFile(file)) {
      return {
        articles: [] as UploadedArticle[],
        error: `"${file.name}" is not a supported file type. Use .txt, .md, or .html.`
      };
    }

    try {
      const rawText = await file.text();
      const text = sanitizeText(normalizeFileText(file, rawText), 20_000);

      articles.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        text,
        mimeType: file.type || "text/plain",
        size: file.size
      });
    } catch (error) {
      console.error("File read failed", error);
      return {
        articles: [] as UploadedArticle[],
        error: `We couldn't read "${file.name}". Try a simpler text-based export instead.`
      };
    }
  }

  return { articles, error: "" };
}
