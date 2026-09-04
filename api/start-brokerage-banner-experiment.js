const VARIANTS = ["graphite", "red", "ivory"];
const ACTIONS = ["impression", "click", "conversion"];
const STATS_KEY = "experiment:start-brokerage-webinar-banner-color-v1";
const MINIMUM_IMPRESSIONS = 40;
const EXPLORATION_RATE = 0.1;

const emptyStats = () => Object.fromEntries(
  VARIANTS.map((variant) => [variant, { impressions: 0, clicks: 0, conversions: 0 }]),
);

export function parseStats(result) {
  const stats = emptyStats();
  const entries = Array.isArray(result)
    ? Array.from({ length: Math.floor(result.length / 2) }, (_, index) => [
        result[index * 2],
        result[index * 2 + 1],
      ])
    : Object.entries(result || {});

  entries.forEach(([field, rawValue]) => {
    const [variant, metric] = String(field).split(":");
    if (!stats[variant] || !ACTIONS.includes(metric)) return;
    const value = Number.parseInt(rawValue, 10);
    stats[variant][metric === "impression" ? "impressions" : `${metric}s`] =
      Number.isFinite(value) && value > 0 ? value : 0;
  });

  return stats;
}

const randomOpenInterval = (random) => Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, random()));

function sampleNormal(random) {
  const u = randomOpenInterval(random);
  const v = randomOpenInterval(random);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleGamma(shape, random) {
  if (shape < 1) {
    return sampleGamma(shape + 1, random) * Math.pow(randomOpenInterval(random), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const normal = sampleNormal(random);
    const scaled = 1 + c * normal;
    if (scaled <= 0) continue;
    const value = scaled ** 3;
    const uniform = randomOpenInterval(random);
    if (uniform < 1 - 0.0331 * normal ** 4) return d * value;
    if (Math.log(uniform) < 0.5 * normal ** 2 + d * (1 - value + Math.log(value))) {
      return d * value;
    }
  }

  return shape;
}

function sampleBeta(successes, failures, random) {
  const successSample = sampleGamma(successes, random);
  const failureSample = sampleGamma(failures, random);
  return successSample / (successSample + failureSample);
}

export function selectVariant(statsInput, random = Math.random) {
  const stats = statsInput || emptyStats();
  const underSampled = VARIANTS.filter(
    (variant) => (stats[variant]?.impressions || 0) < MINIMUM_IMPRESSIONS,
  );

  if (underSampled.length) {
    const lowestImpressions = Math.min(
      ...underSampled.map((variant) => stats[variant]?.impressions || 0),
    );
    const candidates = underSampled.filter(
      (variant) => (stats[variant]?.impressions || 0) === lowestImpressions,
    );
    return candidates[Math.floor(random() * candidates.length) % candidates.length];
  }

  if (random() < EXPLORATION_RATE) {
    return VARIANTS[Math.floor(random() * VARIANTS.length) % VARIANTS.length];
  }

  return VARIANTS.reduce(
    (winner, variant) => {
      const impressions = Math.max(0, stats[variant]?.impressions || 0);
      const clicks = Math.min(impressions, Math.max(0, stats[variant]?.clicks || 0));
      const score = sampleBeta(clicks + 1, impressions - clicks + 1, random);
      return score > winner.score ? { variant, score } : winner;
    },
    { variant: VARIANTS[0], score: -1 },
  ).variant;
}

export function stableFallbackVariant(visitorId = "") {
  let hash = 2166136261;
  for (let index = 0; index < visitorId.length; index += 1) {
    hash ^= visitorId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return VARIANTS[(hash >>> 0) % VARIANTS.length];
}

function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisCommand(config, command) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) throw new Error(`Experiment store responded with ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error("Experiment store rejected the command");
  return payload.result;
}

async function readRequestJson(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }
  if (typeof request.body === "string" || Buffer.isBuffer(request.body)) {
    return JSON.parse(request.body.toString("utf8"));
  }

  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8_192) throw new Error("Request body is too large");
  }
  return body ? JSON.parse(body) : {};
}

function sendJson(response, status, payload) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.status(status).json(payload);
}

export default async function handler(request, response) {
  const method = request.method || "GET";
  if (!['GET', 'POST'].includes(method)) {
    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const config = getRedisConfig();

  if (method === "GET") {
    const requestUrl = new URL(request.url || "/", "https://quadcode.com");
    const visitorId = (requestUrl.searchParams.get("visitor") || "").slice(0, 160);

    if (!config) {
      sendJson(response, 200, {
        variant: stableFallbackVariant(visitorId),
        mode: "split",
      });
      return;
    }

    try {
      const rawStats = await redisCommand(config, ["HGETALL", STATS_KEY]);
      sendJson(response, 200, {
        variant: selectVariant(parseStats(rawStats)),
        mode: "adaptive",
      });
    } catch (error) {
      console.error("Banner experiment assignment failed", error.message);
      sendJson(response, 200, {
        variant: stableFallbackVariant(visitorId),
        mode: "split",
      });
    }
    return;
  }

  try {
    const body = await readRequestJson(request);
    const variant = String(body.variant || "");
    const action = String(body.action || "");
    if (!VARIANTS.includes(variant) || !ACTIONS.includes(action)) {
      sendJson(response, 400, { error: "Invalid experiment event" });
      return;
    }

    if (!config) {
      sendJson(response, 202, { tracked: false, mode: "split" });
      return;
    }

    await redisCommand(config, ["HINCRBY", STATS_KEY, `${variant}:${action}`, 1]);
    sendJson(response, 202, { tracked: true, mode: "adaptive" });
  } catch (error) {
    console.error("Banner experiment event failed", error.message);
    sendJson(response, 400, { error: "Could not process experiment event" });
  }
}

export { ACTIONS, MINIMUM_IMPRESSIONS, STATS_KEY, VARIANTS };
