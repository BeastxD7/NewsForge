import { marked } from "marked"
import sanitizeHtml from "sanitize-html"

/**
 * Converts markdown to sanitized HTML.
 * Strips all script tags and dangerous attributes before rendering.
 * Safe to use with dangerouslySetInnerHTML.
 */
export async function renderMarkdown(content: string): Promise<string> {
  const raw = await marked.parse(content)
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "h1", "h2", "h3", "h4", "h5", "h6",
      "details", "summary", "figure", "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  })
}

/**
 * Synchronous version for client components.
 */
export function renderMarkdownSync(content: string): string {
  const raw = marked.parse(content) as string
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "h1", "h2", "h3", "h4", "h5", "h6",
      "details", "summary", "figure", "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  })
}
