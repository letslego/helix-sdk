import type { AgentSummary, HelixClientOptions, RunOptions, RunResult, SessionRecord, StackSummary, WorkflowRun, RuntimeEvent } from "./types.js";
export type * from "./types.js";
export declare class HelixError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(message: string, status: number, body: unknown);
}
/**
 * Typed client for a running Helix console (`helix console`).
 * Talks to the stable `/helix/v1/*` HTTP surface.
 */
export declare class HelixClient {
    private baseUrl;
    private token?;
    private fetchImpl;
    constructor(options: HelixClientOptions);
    /** GET /helix/v1/agent */
    agent(): Promise<AgentSummary>;
    /** GET /helix/v1/stack */
    stack(): Promise<StackSummary>;
    /** GET /helix/v1/sessions */
    sessions(): Promise<SessionRecord[]>;
    /** GET /helix/v1/workflows */
    workflows(sessionId?: string): Promise<WorkflowRun[]>;
    /** GET /helix/v1/events */
    events(sessionId?: string): Promise<RuntimeEvent[]>;
    /** POST /helix/v1/sessions — start or continue a turn */
    run(options: RunOptions): Promise<RunResult>;
    /** Convenience: run and keep talking on the same sessionId. */
    chat(message: string, sessionId?: string, opts?: {
        autoApprove?: boolean;
        channel?: string;
    }): Promise<RunResult>;
    /** POST /helix/v1/approvals */
    resolveApproval(sessionId: string, approvalId: string, approve: boolean): Promise<SessionRecord>;
    /** POST /helix/v1/schedules/run */
    runSchedule(name: string): Promise<RunResult>;
    private request;
}
export default HelixClient;
//# sourceMappingURL=index.d.ts.map