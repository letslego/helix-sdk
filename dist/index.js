export class HelixError extends Error {
    status;
    body;
    constructor(message, status, body) {
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
    baseUrl;
    token;
    fetchImpl;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.token = options.token;
        this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    }
    /** GET /helix/v1/agent */
    agent() {
        return this.request("GET", "/helix/v1/agent");
    }
    /** GET /helix/v1/stack */
    stack() {
        return this.request("GET", "/helix/v1/stack");
    }
    /** GET /helix/v1/sessions */
    sessions() {
        return this.request("GET", "/helix/v1/sessions");
    }
    /** GET /helix/v1/workflows */
    workflows(sessionId) {
        const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
        return this.request("GET", `/helix/v1/workflows${qs}`);
    }
    /** GET /helix/v1/events */
    events(sessionId) {
        const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
        return this.request("GET", `/helix/v1/events${qs}`);
    }
    /** POST /helix/v1/sessions — start or continue a turn */
    run(options) {
        return this.request("POST", "/helix/v1/sessions", {
            message: options.message,
            sessionId: options.sessionId,
            autoApprove: options.autoApprove ?? false,
            channel: options.channel ?? "http",
        });
    }
    /** Convenience: run and keep talking on the same sessionId. */
    async chat(message, sessionId, opts = {}) {
        return this.run({
            message,
            sessionId,
            autoApprove: opts.autoApprove,
            channel: opts.channel,
        });
    }
    /** POST /helix/v1/approvals */
    resolveApproval(sessionId, approvalId, approve) {
        return this.request("POST", "/helix/v1/approvals", {
            sessionId,
            approvalId,
            approve,
        });
    }
    /** POST /helix/v1/schedules/run */
    runSchedule(name) {
        return this.request("POST", "/helix/v1/schedules/run", { name });
    }
    async request(method, path, body) {
        const headers = {
            accept: "application/json",
        };
        if (body !== undefined)
            headers["content-type"] = "application/json";
        if (this.token)
            headers.authorization = `Bearer ${this.token}`;
        const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            }
            catch {
                data = text;
            }
        }
        if (!res.ok) {
            const msg = typeof data === "object" &&
                data &&
                "error" in data &&
                typeof data.error === "string"
                ? data.error
                : `Helix HTTP ${res.status}`;
            throw new HelixError(msg, res.status, data);
        }
        return data;
    }
}
export default HelixClient;
//# sourceMappingURL=index.js.map