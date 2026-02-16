# Cache and Webhook: Data Transfer and Fresh Content

## Does high traffic spike microCMS data transfer?

**No.** With the current setup:

1. **Nitro cache** (`cachedEventHandler` with `maxAge` + `staleMaxAge`): The first request (per cache key) calls microCMS; later requests are served from the in-memory cache. So many users at the same time do **not** mean many microCMS API calls.

2. **Vercel CDN** (`vercel.json` headers): Responses are cached at the edge. Most requests are served from the CDN and never hit your server or microCMS.

So even when a lot of users access the site at once (including from different countries), **microCMS data transfer stays low**.

---

## Why use a Webhook?

Caching reduces data transfer but also delays **when new or updated content appears** (up to `maxAge` or your CDN `s-maxage`, e.g. 1 hour).

**Webhook** is used so that when something changes in microCMS (publish / update / delete), microCMS sends a POST to your app. Your app can then:

- **Invalidate cache** (e.g. clear Nitro cache for list/article), or  
- **Trigger a rebuild** (e.g. Vercel Deploy Hook, `nuxt generate`),

so the next request gets fresh data and **new articles appear quickly**, without giving up caching or causing a data-transfer spike.

So:

- **Cache** → low data transfer, fewer microCMS calls.  
- **Webhook** → content change triggers invalidation/rebuild → fast content updates.

---

## Setup in this project

- **Server:** `list`, `article`, `featured-news` use `maxAge` + `staleMaxAge` (stale-while-revalidate).  
- **CDN:** `vercel.json` sets Cache-Control / Vercel-CDN-Cache-Control for `/api/*` and pages.  
- **Webhook:** Configure microCMS 「API設定」→「Webhook」→「カスタム通知」 to POST to `https://your-domain.com/api/webhook`. Set the same secret in microCMS (Webhook のセキュリティ保護) and in your env as `MICROCMS_WEBHOOK_SECRET`. On receive, the app verifies the `x-microcms-signature` header and clears Nitro cache so list/article/featured-news are refreshed on next request.
