/**
 * Nav is imported at build time so it's bundled and works in serverless (Vercel).
 * Reading from process.cwd() + 'data/nav.json' fails in production because data/ is not in the deploy.
 */
import navData from "../../data/nav.json";

export default defineEventHandler(() => navData as { nav: unknown[] });
