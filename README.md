# Helix SDK (TypeScript)

Typed client for a running [Helix](https://github.com/letslego/helix) console — the stable `/helix/v1/*` HTTP API.

```bash
npm install @letslego/helix-sdk
# or: npm install github:letslego/helix-sdk#main
```

## Quick start

```ts
import { HelixClient } from "@letslego/helix-sdk";

const helix = new HelixClient({ baseUrl: "http://127.0.0.1:8787" });

const turn = await helix.chat("Plan a weekend trip to Paris", undefined, {
  autoApprove: true,
});
console.log(turn.reply);

const again = await helix.chat("Make it cheaper", turn.sessionId);
console.log(again.reply);

if (again.parked) {
  const session = await helix.sessions();
  // resolve pending approvals with helix.resolveApproval(sessionId, approvalId, true)
}
```

## API

| Method | HTTP |
| --- | --- |
| `agent()` | `GET /helix/v1/agent` |
| `stack()` | `GET /helix/v1/stack` |
| `sessions()` | `GET /helix/v1/sessions` |
| `workflows(sessionId?)` | `GET /helix/v1/workflows` |
| `events(sessionId?)` | `GET /helix/v1/events` |
| `run({ message, … })` / `chat(…)` | `POST /helix/v1/sessions` |
| `resolveApproval(…)` | `POST /helix/v1/approvals` |
| `runSchedule(name)` | `POST /helix/v1/schedules/run` |

Start a local agent first:

```bash
npx @letslego/helix init my-agent
cd my-agent && npm install && npx helix console
```

## Ecosystem

- Framework: [helix](https://github.com/letslego/helix)
- Python SDK: [helix-sdk-python](https://github.com/letslego/helix-sdk-python)
- Go SDK: [helix-sdk-go](https://github.com/letslego/helix-sdk-go)
- Overview: [helix-ecosystem](https://letslego.github.io/helix-ecosystem/)

## License

Apache-2.0 © LetsLego
