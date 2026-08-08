import assert from "node:assert/strict";
import { test } from "node:test";
import { HelixClient, HelixError } from "../dist/index.js";

function mockFetch(handler: (url: string, init?: RequestInit) => unknown): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const data = await handler(url, init);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

test("HelixClient run posts to /helix/v1/sessions", async () => {
  let seen = "";
  let body: Record<string, unknown> = {};
  const client = new HelixClient({
    baseUrl: "http://127.0.0.1:8787/",
    fetch: mockFetch((url, init) => {
      seen = url;
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return {
        sessionId: "s1",
        reply: "hello",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2, estimatedCostUsd: 0 },
        toolCalls: [],
        events: [],
      };
    }),
  });

  const result = await client.chat("Plan a trip", undefined, { autoApprove: true });
  assert.equal(seen, "http://127.0.0.1:8787/helix/v1/sessions");
  assert.equal(body.message, "Plan a trip");
  assert.equal(body.autoApprove, true);
  assert.equal(result.sessionId, "s1");
  assert.equal(result.reply, "hello");
});

test("HelixClient agent and events", async () => {
  const client = new HelixClient({
    baseUrl: "http://example.test",
    token: "secret",
    fetch: mockFetch((url, init) => {
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers.authorization, "Bearer secret");
      if (url.endsWith("/helix/v1/agent")) {
        return {
          summary: {},
          tools: [],
          skills: [],
          config: { model: "mock/helix-demo" },
          channels: [],
          connections: [],
          subagents: [],
          schedules: [],
          sandbox: {},
          rootDir: "/tmp",
        };
      }
      if (url.includes("/helix/v1/events")) {
        return [{ type: "session.start", at: "t", sessionId: "s1" }];
      }
      throw new Error(`unexpected ${url}`);
    }),
  });

  const agent = await client.agent();
  assert.equal(agent.config.model, "mock/helix-demo");
  const events = await client.events("s1");
  assert.equal(events[0]?.type, "session.start");
});

test("HelixClient throws HelixError on non-OK", async () => {
  const client = new HelixClient({
    baseUrl: "http://example.test",
    fetch: (async () =>
      new Response(JSON.stringify({ error: "not_found" }), { status: 404 })) as typeof fetch,
  });
  await assert.rejects(() => client.stack(), (err: unknown) => {
    assert.ok(err instanceof HelixError);
    assert.equal(err.status, 404);
    assert.equal(err.message, "not_found");
    return true;
  });
});

test("resolveApproval and runSchedule", async () => {
  const paths: string[] = [];
  const client = new HelixClient({
    baseUrl: "http://example.test",
    fetch: mockFetch((url) => {
      paths.push(new URL(url).pathname);
      if (url.includes("approvals")) {
        return {
          id: "s1",
          createdAt: "",
          updatedAt: "",
          messages: [],
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
          status: "active",
          pendingApprovals: [],
        };
      }
      return {
        sessionId: "s1",
        reply: "done",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
        toolCalls: [],
        events: [],
      };
    }),
  });
  await client.resolveApproval("s1", "a1", true);
  await client.runSchedule("weekend_watch");
  assert.deepEqual(paths, ["/helix/v1/approvals", "/helix/v1/schedules/run"]);
});
