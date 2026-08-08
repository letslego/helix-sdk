export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
}
export interface ApprovalRequest {
    id: string;
    toolName: string;
    input: unknown;
    createdAt: string;
    status: "pending" | "approved" | "denied";
}
export interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
}
export interface SessionRecord {
    id: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessage[];
    usage: TokenUsage;
    status: "active" | "parked" | "completed" | "failed";
    pendingApprovals: ApprovalRequest[];
    approvedToolKeys?: string[];
    workflowId?: string;
    channel?: string;
}
export interface RuntimeEvent {
    type: string;
    at: string;
    sessionId: string;
    data?: Record<string, unknown>;
}
export interface RunResult {
    sessionId: string;
    workflowId?: string;
    reply: string;
    usage: TokenUsage;
    toolCalls: Array<{
        name: string;
        input: unknown;
        output: unknown;
    }>;
    events: RuntimeEvent[];
    parked?: boolean;
    modelUsed?: string;
}
export interface WorkflowRun {
    id: string;
    sessionId: string;
    status: "running" | "parked" | "completed" | "failed";
    createdAt: string;
    updatedAt: string;
    steps: Array<{
        name: string;
        status: "done" | "error";
        result?: unknown;
        error?: string;
        at: string;
    }>;
    park?: {
        reason: string;
        data?: Record<string, unknown>;
        at: string;
    };
    meta?: Record<string, unknown>;
}
export interface AgentSummary {
    summary: Record<string, unknown>;
    tools: Array<{
        name: string;
        description: string;
        requiresApproval?: boolean;
    }>;
    skills: Array<{
        name: string;
        description?: string;
    }>;
    config: Record<string, unknown>;
    channels: unknown[];
    connections: Array<{
        name: string;
        kind: string;
        description: string;
    }>;
    subagents: Array<{
        name: string;
        description: string;
    }>;
    schedules: unknown[];
    sandbox: Record<string, unknown>;
    rootDir: string;
}
export interface StackSummary {
    runtime: string;
    gateway: Record<string, unknown>;
    sandbox: Record<string, unknown>;
    channels: unknown[];
    connections: string[];
    subagents: string[];
    schedules: Array<{
        name: string;
        cron: string;
    }>;
    tools: string[];
    skills: string[];
}
export interface RunOptions {
    message: string;
    sessionId?: string;
    autoApprove?: boolean;
    channel?: string;
}
export interface HelixClientOptions {
    /** Base URL of a running Helix console, e.g. http://127.0.0.1:8787 */
    baseUrl: string;
    /** Optional bearer token (sent as Authorization: Bearer …). */
    token?: string;
    /** Override fetch (useful in tests / edge runtimes). */
    fetch?: typeof fetch;
}
//# sourceMappingURL=types.d.ts.map