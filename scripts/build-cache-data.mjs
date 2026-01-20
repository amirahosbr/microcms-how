import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "microcms-js-sdk";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;
const NEWS_ENDPOINT = process.env.MICROCMS_NEWS_ENDPOINT;
const NEWS_CACHE_PATH = join(projectRoot, "data", "cache", "news.json");
const ENV = process.env.NODE_ENV;

const isDev = ENV === "development";

/**
 * Fetch all data from microCMS with pagination
 */
const fetchAllData = async (client, endpoint) => {
  const limit = 100;
  let offset = 0;
  let allContents = [];
  let totalCount = 0;

  console.log(`Fetching data from ${endpoint}...`);

  // Fetch first page to get total count
  const firstPage = await client.getList({
    endpoint,
    queries: { limit, offset },
  });

  totalCount = firstPage.totalCount;
  allContents = [...firstPage.contents];

  console.log(`  Found ${totalCount} total items`);

  // Fetch remaining pages if needed
  if (totalCount > limit) {
    const totalPages = Math.ceil(totalCount / limit);
    console.log(`  Fetching ${totalPages} pages...`);

    for (let page = 1; page < totalPages; page++) {
      offset = page * limit;
      const pageData = await client.getList({
        endpoint,
        queries: { limit, offset },
      });
      allContents = [...allContents, ...pageData.contents];
      console.log(`  Fetched page ${page + 1}/${totalPages}`);
    }
  }

  return {
    contents: allContents,
    totalCount,
    offset: 0,
    limit: totalCount,
  };
};

const build = async () => {
  // Ensure cache directory exists
  const cacheDir = dirname(NEWS_CACHE_PATH);
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  // Check if files exist in development mode
  if (isDev) {
    const newsExists = existsSync(NEWS_CACHE_PATH);

    if (newsExists) {
      console.log(
        "✓ Cache files already exist in development mode. Skipping fetch.",
      );
      return;
    }
  }

  // Validate environment variables
  if (!DOMAIN || !API_KEY || !NEWS_ENDPOINT) {
    console.error(
      "Error: Missing required environment variables (MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY, MICROCMS_NEWS_ENDPOINT)",
    );
    process.exit(1);
  }

  // Create microCMS client
  const client = createClient({
    serviceDomain: DOMAIN,
    apiKey: API_KEY,
  });

  console.log("Fetching data from microCMS...");

  try {
    // Fetch all news data
    const newsData = await fetchAllData(client, NEWS_ENDPOINT);
    writeFileSync(NEWS_CACHE_PATH, JSON.stringify(newsData, null, 2));
    console.log(
      `✓ Saved ${newsData.totalCount} news items to ${NEWS_CACHE_PATH}`,
    );

    console.log("✓ Cache data build completed successfully!");
  } catch (error) {
    console.error("Error fetching data from microCMS:", error);
    process.exit(1);
  }
};

build();
