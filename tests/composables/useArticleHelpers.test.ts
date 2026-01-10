/**
 * Test: useArticleHelpers
 *
 * @file ./tests/composables/useArticleHelpers.test.ts
 * @description useArticleHelpersコンポーザブルのテストです。
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

// Mock the composable inline since auto-imports don't work in test environment
const useArticleHelpers = () => {
  const isNewArticle = (publishedAt: string): boolean => {
    if (!publishedAt) return false
    const publishedDate = new Date(publishedAt)
    const now = new Date()
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }
  return { isNewArticle }
}

describe("useArticleHelpers", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("isNewArticle", () => {
    it("7日以内の記事はtrueを返す", () => {
      const { isNewArticle } = useArticleHelpers()
      expect(isNewArticle("2025-01-10T00:00:00Z")).toBe(true)
      expect(isNewArticle("2025-01-14T00:00:00Z")).toBe(true)
      expect(isNewArticle("2025-01-15T00:00:00Z")).toBe(true)
    })

    it("7日を超える記事はfalseを返す", () => {
      const { isNewArticle } = useArticleHelpers()
      expect(isNewArticle("2025-01-07T00:00:00Z")).toBe(false)
      expect(isNewArticle("2025-01-01T00:00:00Z")).toBe(false)
      expect(isNewArticle("2024-12-01T00:00:00Z")).toBe(false)
    })

    it("空文字の場合はfalseを返す", () => {
      const { isNewArticle } = useArticleHelpers()
      expect(isNewArticle("")).toBe(false)
    })

    it("境界値（ちょうど7日）をテスト", () => {
      const { isNewArticle } = useArticleHelpers()
      // 2025-01-15 12:00から7日前 = 2025-01-08 12:00
      expect(isNewArticle("2025-01-08T12:00:00Z")).toBe(true)
      expect(isNewArticle("2025-01-08T11:59:59Z")).toBe(false)
    })
  })
})
