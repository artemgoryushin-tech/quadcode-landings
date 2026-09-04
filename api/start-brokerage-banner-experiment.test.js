import assert from "node:assert/strict";
import test from "node:test";

import handler, {
  VARIANTS,
  parseStats,
  selectVariant,
  stableFallbackVariant,
} from "./start-brokerage-banner-experiment.js";

const createResponse = () => {
  const result = { headers: {}, statusCode: 0, body: null };
  return {
    result,
    setHeader(name, value) {
      result.headers[name.toLowerCase()] = value;
    },
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
};

test("parses Redis hash results into experiment metrics", () => {
  assert.deepEqual(
    parseStats([
      "graphite:impression", "50",
      "graphite:click", "5",
      "red:impression", "60",
      "red:conversion", "3",
    ]),
    {
      graphite: { impressions: 50, clicks: 5, conversions: 0 },
      red: { impressions: 60, clicks: 0, conversions: 3 },
      ivory: { impressions: 0, clicks: 0, conversions: 0 },
    },
  );
});

test("balances traffic toward the least-sampled color during warm-up", () => {
  const stats = {
    graphite: { impressions: 12, clicks: 2, conversions: 0 },
    red: { impressions: 3, clicks: 1, conversions: 0 },
    ivory: { impressions: 8, clicks: 1, conversions: 0 },
  };
  assert.equal(selectVariant(stats, () => 0.4), "red");
});

test("Thompson sampling favors the color with the strongest CTR", () => {
  let seed = 1729;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  const stats = {
    graphite: { impressions: 600, clicks: 30, conversions: 2 },
    red: { impressions: 600, clicks: 108, conversions: 8 },
    ivory: { impressions: 600, clicks: 42, conversions: 3 },
  };
  const selections = Object.fromEntries(VARIANTS.map((variant) => [variant, 0]));

  for (let index = 0; index < 300; index += 1) {
    selections[selectVariant(stats, random)] += 1;
  }

  assert.ok(selections.red > selections.graphite * 3, JSON.stringify(selections));
  assert.ok(selections.red > selections.ivory * 3, JSON.stringify(selections));
});

test("fallback split is stable for the same visitor", () => {
  const first = stableFallbackVariant("visitor-123");
  assert.ok(VARIANTS.includes(first));
  assert.equal(stableFallbackVariant("visitor-123"), first);
});

test("serves a deterministic split when no shared store is configured", async () => {
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const previousIntegrationUrl = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const previousIntegrationToken = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  const previousKvUrl = process.env.KV_REST_API_URL;
  const previousKvToken = process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;

  try {
    const response = createResponse();
    await handler(
      { method: "GET", url: "/api/start-brokerage-banner-experiment?visitor=visitor-123" },
      response,
    );
    assert.equal(response.result.statusCode, 200);
    assert.equal(response.result.body.mode, "split");
    assert.equal(response.result.body.variant, stableFallbackVariant("visitor-123"));
  } finally {
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
    if (previousIntegrationUrl === undefined) delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    else process.env.UPSTASH_REDIS_REST_KV_REST_API_URL = previousIntegrationUrl;
    if (previousIntegrationToken === undefined) delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
    else process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN = previousIntegrationToken;
    if (previousKvUrl === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = previousKvUrl;
    if (previousKvToken === undefined) delete process.env.KV_REST_API_TOKEN;
    else process.env.KV_REST_API_TOKEN = previousKvToken;
  }
});

test("uses Vercel's Upstash integration variables and records events in adaptive mode", async () => {
  const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const previousIntegrationUrl = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const previousIntegrationToken = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  const originalFetch = globalThis.fetch;
  const commands = [];
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN = "test-token";
  globalThis.fetch = async (_url, options) => {
    const command = JSON.parse(options.body);
    commands.push(command);
    if (command[0] === "HGETALL") {
      return new Response(JSON.stringify({
        result: [
          "graphite:impression", "80",
          "graphite:click", "4",
          "red:impression", "80",
          "red:click", "16",
          "ivory:impression", "80",
          "ivory:click", "6",
        ],
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ result: 1 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const assignmentResponse = createResponse();
    await handler(
      { method: "GET", url: "/api/start-brokerage-banner-experiment?visitor=new-visitor" },
      assignmentResponse,
    );
    assert.equal(assignmentResponse.result.statusCode, 200);
    assert.equal(assignmentResponse.result.body.mode, "adaptive");
    assert.ok(VARIANTS.includes(assignmentResponse.result.body.variant));

    const eventResponse = createResponse();
    await handler(
      { method: "POST", body: { variant: "red", action: "click" } },
      eventResponse,
    );
    assert.equal(eventResponse.result.statusCode, 202);
    assert.deepEqual(eventResponse.result.body, { tracked: true, mode: "adaptive" });
    assert.deepEqual(commands.at(-1), [
      "HINCRBY",
      "experiment:start-brokerage-webinar-banner-color-v1",
      "red:click",
      1,
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
    if (previousIntegrationUrl === undefined) delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    else process.env.UPSTASH_REDIS_REST_KV_REST_API_URL = previousIntegrationUrl;
    if (previousIntegrationToken === undefined) delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
    else process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN = previousIntegrationToken;
  }
});

test("rejects malformed experiment events", async () => {
  const response = createResponse();
  await handler(
    { method: "POST", url: "/api/start-brokerage-banner-experiment", body: { variant: "blue", action: "click" } },
    response,
  );
  assert.equal(response.result.statusCode, 400);
  assert.deepEqual(response.result.body, { error: "Invalid experiment event" });
});
