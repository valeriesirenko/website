import { getStore } from "@netlify/blobs";

const DESTINATION =
  "https://www.orions-belt.net/archives/just-listed-hardwood-floors-and-a-generous-curse";

const STORE_NAME = "just-listed";
const KEY = "counter";

// Link previews and crawlers fetch this URL too. They still get redirected,
// but they are tallied separately so `visits` stays close to real readers.
const BOT_UA =
  /bot|crawler|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|slack|twitter|linkedin|pinterest|reddit|embedly|quora|applebot|bingpreview|skypeuripreview|vkshare|preview|curl|wget|python-requests|axios|go-http-client|headlesschrome|lighthouse|pingdom|uptimerobot|gtmetrix/i;

const emptyCounter = () => ({ visits: 0, bots: 0, firstSeen: null, lastSeen: null });

function store() {
  // Strong consistency so a read-then-write increment sees the latest value.
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

async function read() {
  const current = await store().get(KEY, { type: "json" });
  return { ...emptyCounter(), ...(current ?? {}) };
}

async function increment(field) {
  const current = await read();
  const now = new Date().toISOString();
  const next = {
    ...current,
    [field]: (current[field] ?? 0) + 1,
    firstSeen: current.firstSeen ?? now,
    lastSeen: now,
  };
  await store().setJSON(KEY, next);
  return next;
}

const noStore = { "cache-control": "no-store" };

export default async (req) => {
  const url = new URL(req.url);

  // /just-listed?stats -> read the tally without incrementing it.
  // Set a STATS_TOKEN env var in Netlify to require /just-listed?stats=<token>.
  if (url.searchParams.has("stats")) {
    const token = process.env.STATS_TOKEN;
    if (token && url.searchParams.get("stats") !== token) {
      return new Response("Not found", { status: 404, headers: noStore });
    }
    return Response.json(await read(), { headers: noStore });
  }

  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    await increment(BOT_UA.test(userAgent) ? "bots" : "visits");
  } catch (error) {
    // Never let a counter failure block the redirect.
    console.error("just-listed: could not record visit", error);
  }

  return new Response(null, {
    status: 302,
    headers: { location: DESTINATION, ...noStore },
  });
};

export const config = { path: "/just-listed" };
