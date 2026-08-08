import type {
  AgentSummary,
  HelixClientOptions,
  RunOptions,
  RunResult,
  SessionRecord,
  StackSummary,
  WorkflowRun,
  RuntimeEvent,
} from "./types.js";

export type * from "./types.js";

export class HelixError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "HelixError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Typed client for a running Helix console (`helix console`).
 * Talks to the stable `/helix/v1/*` HTTP surface.
 */
export class HelixClient {
  private baseUrl: string;
  private token?: string;
  private fetchImpl: typeof fetch;

  constructor(options: HelixClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /** GET /helix/v1/agent */
  agent(): Promise<AgentSummary> {
    return this.request<AgentSummary>("GET", "/helix/v1/agent");
  }

  /** GET /helix/v1/stack */
  stack(): Promise<StackSummary> {
    return this.request<StackSummary>("GET", "/helix/v1/stack");
  }

  /** GET /helix/v1/sessions */
  sessions(): Promise<SessionRecord[]> {
    return this.request<SessionRecord[]>("GET", "/helix/v1/sessions");
  }

  /** GET /helix/v1/workflows */
  workflows(sessionId?: string): Promise<WorkflowRun[]> {
    const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
    return this.request<WorkflowRun[]>("GET", `/helix/v1/workflows${qs}`);
  }

  /** GET /helix/v1/events */
  events(sessionId?: string): Promise<RuntimeEvent[]> {
    const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
    return this.request<RuntimeEvent[]>("GET", `/helix/v1/events${qs}`);
  }

  /** POST /helix/v1/sessions — start or continue a turn */
  run(options: RunOptions): Promise<RunResult> {
    return this.request<RunResult>("POST", "/helix/v1/sessions", {
      message: options.message,
      sessionId: options.sessionId,
      autoApprove: options.autoApprove ?? false,
      channel: options.channel ?? "http",
    });
  }

  /** Convenience: run and keep talking on the same sessionId. */
  async chat(
    message: string,
    sessionId?: string,
    opts: { autoApprove?: boolean; channel?: string } = {},
  ): Promise<RunResult> {
    return this.run({
      message,
      sessionId,
      autoApprove: opts.autoApprove,
      channel: opts.channel,
    });
  }

  /** POST /helix/v1/approvals */
  resolveApproval(
    sessionId: string,
    approvalId: string,
    approve: boolean,
  ): Promise<SessionRecord> {
    return this.request<SessionRecord>("POST", "/helix/v1/approvals", {
      sessionId,
      approvalId,
      approve,
    });
  }

  /** POST /helix/v1/schedules/run */
  runSchedule(name: string): Promise<RunResult> {
    return this.request<RunResult>("POST", "/helix/v1/schedules/run", { name });
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const headers: Record<string, string> = {
      accept: "application/json",
    };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (this.token) headers.authorization = `Bearer ${this.token}`;

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" &&
        data &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : `Helix HTTP ${res.status}`;
      throw new HelixError(msg, res.status, data);
    }

    return data as T;
  }
}

export default HelixClient;
