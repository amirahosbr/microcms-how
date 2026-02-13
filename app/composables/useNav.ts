/**
 * Single source of truth for nav: loads from data/nav.json via /api/nav.
 * Use in Header, footer, or any component that needs the same nav.
 */
const getPath = (item: unknown): string =>
  (item as { path?: string })?.path ?? ''

const getName = (item: unknown): string =>
  (item as { name?: string })?.name ?? ''

const getChildren = (item: unknown): unknown[] =>
  (item as { children?: unknown[] })?.children ?? []

const hasChildren = (item: unknown): boolean => {
  const children = getChildren(item)
  return Array.isArray(children) && children.length > 0
}

export function useNav() {
  const { data } = useFetch<{ nav: unknown[] }>('/api/nav', {
    default: () => ({ nav: [] }),
    pick: ['nav'],
  })

  const nav = computed(() => data.value?.nav ?? [])

  return {
    nav,
    getPath,
    getName,
    getChildren,
    hasChildren,
  }
}
