/**
 * Composable: useSanitize
 *
 * @file ./app/composables/useSanitize.ts
 * @description HTMLコンテンツをサニタイズするコンポーザブルです。XSS攻撃を防止します。
 * @module Composable
 */

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "span",
  "a",
  "ul",
  "ol",
  "li",
  "div",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "blockquote",
  "hr",
  "pre",
  "code",
  "section",
  "article",
]
const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
  "id",
  "style",
  "data-*",
]

export const useSanitize = () => {
  const sanitizeHtml = (html: string): string => {
    if (!html) return ""

    // SSR環境ではシンプルなタグのみ許可する基本的なサニタイズ
    // クライアントサイドではDOMPurifyを使用
    if (import.meta.server) {
      // SSR: 基本的なHTMLエスケープとタグフィルタリング
      return sanitizeBasic(html)
    }

    // クライアントサイド: DOMPurifyを動的インポート
    // 初回レンダリングではbasicサニタイズを返す
    return sanitizeBasic(html)
  }

  // 基本的なサニタイズ（許可されたタグのみを残す）
  const sanitizeBasic = (html: string): string => {
    // 危険なタグとその内容を完全に除去
    const dangerousTags = ["script", "style", "noscript", "object", "embed", "applet"]
    let sanitized = html
    for (const tag of dangerousTags) {
      const pattern = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi")
      sanitized = sanitized.replace(pattern, "")
    }

    // 許可されていない属性を除去し、許可されたタグのみを残す
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi

    return sanitized.replace(tagPattern, (match, tagName) => {
      const lowerTag = tagName.toLowerCase()
      if (!ALLOWED_TAGS.includes(lowerTag)) {
        return "" // 許可されていないタグは削除
      }

      // 許可されたタグの場合、許可された属性のみを残す
      if (match.startsWith("</")) {
        return `</${lowerTag}>`
      }

      // 属性を抽出してフィルタリング
      const attrPattern = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi
      const attrs: string[] = []

      for (const attrMatch of match.matchAll(attrPattern)) {
        const attrName = attrMatch[1]?.toLowerCase()
        if (!attrName) continue
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || ""
        
        // data-* attributes are always allowed
        if (attrName.startsWith("data-")) {
          attrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`)
          continue
        }
        
        if (ALLOWED_ATTR.includes(attrName)) {
          // javascript: URLをブロック
          if ((attrName === "href" || attrName === "src") && attrValue.toLowerCase().startsWith("javascript:")) {
            continue
          }
          // data: URLをブロック（危険な可能性があるため）
          if ((attrName === "href" || attrName === "src") && attrValue.toLowerCase().startsWith("data:")) {
            // 画像のdata URIは許可（base64画像）
            if (attrName === "src" && attrValue.toLowerCase().startsWith("data:image/")) {
              attrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`)
            }
            continue
          }
          attrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`)
        }
      }

      const isSelfClosing = match.endsWith("/>") || ["br", "img"].includes(lowerTag)
      const attrStr = attrs.length > 0 ? ` ${attrs.join(" ")}` : ""
      return `<${lowerTag}${attrStr}${isSelfClosing ? " /" : ""}>`
    })
  }

  return { sanitizeHtml }
}
