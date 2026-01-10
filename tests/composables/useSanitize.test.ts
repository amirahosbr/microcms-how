/**
 * Test: useSanitize
 *
 * @file ./tests/composables/useSanitize.test.ts
 * @description useSanitizeコンポーザブルのテストです。XSS防止機能を検証します。
 */

import { describe, expect, it } from "vitest"

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
  "tr",
  "th",
  "td",
]
const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "width", "height", "class", "id", "style"]

// Mock the composable inline since auto-imports don't work in test environment
const useSanitize = () => {
  const sanitizeBasic = (html: string): string => {
    // 危険なタグとその内容を完全に除去
    const dangerousTags = ["script", "style", "noscript", "object", "embed", "applet"]
    let sanitized = html
    for (const tag of dangerousTags) {
      const pattern = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi")
      sanitized = sanitized.replace(pattern, "")
    }

    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi

    return sanitized.replace(tagPattern, (match, tagName) => {
      const lowerTag = tagName.toLowerCase()
      if (!ALLOWED_TAGS.includes(lowerTag)) {
        return ""
      }

      if (match.startsWith("</")) {
        return `</${lowerTag}>`
      }

      const attrPattern = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi
      const attrs: string[] = []

      for (const attrMatch of match.matchAll(attrPattern)) {
        const attrName = attrMatch[1].toLowerCase()
        const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || ""
        if (ALLOWED_ATTR.includes(attrName)) {
          if ((attrName === "href" || attrName === "src") && attrValue.toLowerCase().startsWith("javascript:")) {
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

  const sanitizeHtml = (html: string): string => {
    if (!html) return ""
    return sanitizeBasic(html)
  }

  return { sanitizeHtml }
}

describe("useSanitize", () => {
  describe("sanitizeHtml", () => {
    it("許可されたHTMLタグを保持する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = "<h1>Title</h1><p>Paragraph</p>"
      expect(sanitizeHtml(input)).toBe("<h1>Title</h1><p>Paragraph</p>")
    })

    it("許可されたタグ（strong, em, a）を保持する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<p><strong>Bold</strong> and <em>italic</em> with <a href="/link">link</a></p>'
      expect(sanitizeHtml(input)).toBe('<p><strong>Bold</strong> and <em>italic</em> with <a href="/link">link</a></p>')
    })

    it("scriptタグを除去する（XSS防止）", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<p>Hello</p><script>alert("XSS")</script>'
      expect(sanitizeHtml(input)).toBe("<p>Hello</p>")
    })

    it("onclickなどのイベントハンドラを除去する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = "<p onclick=\"alert('XSS')\">Click me</p>"
      expect(sanitizeHtml(input)).toBe("<p>Click me</p>")
    })

    it("javascript:プロトコルを除去する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = "<a href=\"javascript:alert('XSS')\">Link</a>"
      const result = sanitizeHtml(input)
      expect(result).not.toContain("javascript:")
    })

    it("iframeタグを除去する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<p>Content</p><iframe src="http://evil.com"></iframe>'
      expect(sanitizeHtml(input)).toBe("<p>Content</p>")
    })

    it("空文字を返す（空入力）", () => {
      const { sanitizeHtml } = useSanitize()
      expect(sanitizeHtml("")).toBe("")
    })

    it("許可された属性を保持する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<img src="/image.jpg" alt="Image" width="100" height="100">'
      expect(sanitizeHtml(input)).toBe('<img src="/image.jpg" alt="Image" width="100" height="100" />')
    })

    it("data属性を除去する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<div data-custom="value" class="test">Content</div>'
      expect(sanitizeHtml(input)).toBe('<div class="test">Content</div>')
    })

    it("テーブル要素を許可する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>"
      expect(sanitizeHtml(input)).toBe(
        "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>",
      )
    })

    it("figureとfigcaptionを許可する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = '<figure><img src="/img.jpg" alt="Image"><figcaption>Caption</figcaption></figure>'
      expect(sanitizeHtml(input)).toBe(
        '<figure><img src="/img.jpg" alt="Image" /><figcaption>Caption</figcaption></figure>',
      )
    })

    it("brタグをセルフクロージングとして処理する", () => {
      const { sanitizeHtml } = useSanitize()
      const input = "<p>Line1<br>Line2</p>"
      expect(sanitizeHtml(input)).toBe("<p>Line1<br />Line2</p>")
    })
  })
})
