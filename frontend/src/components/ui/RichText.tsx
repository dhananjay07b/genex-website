import { useMemo } from 'react'

interface RichTextProps {
  html: string
  className?: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/**
 * Wagtail's rich text expander (expand_db_html) resolves image/embed/document
 * references to paths relative to the Django backend (e.g. `/media/images/x.jpg`,
 * `/documents/2/file.pdf`) — it has no notion of this being consumed by a
 * separate frontend origin. Left as-is, the browser resolves them against the
 * SPA's own origin instead of the backend that actually serves them. Internal
 * page links (any other relative href) are left untouched — those already
 * match the frontend SPA's own routes.
 */
function resolveBackendMediaUrls(html: string): string {
  return html.replace(
    /(src|href)="(\/(?:media|documents)\/[^"]*)"/g,
    (_match, attr: string, path: string) => `${attr}="${API_BASE}${path}"`,
  )
}

/**
 * Renders Wagtail RichTextBlock/RichTextField HTML output.
 * The `rich-text` class (src/index.css) supplies structural styling for every
 * feature Wagtail's default rich text toolbar exposes: bold, italic, H2–H4,
 * bullet/numeric lists, links, hr, images, and embeds. Pass sizing/color
 * classes via `className` — headings, bold, and lists inherit that color.
 */
export function RichText({ html, className = '' }: RichTextProps) {
  const resolvedHtml = useMemo(() => resolveBackendMediaUrls(html), [html])

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: resolvedHtml }}
    />
  )
}
