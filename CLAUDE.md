# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Automatically use context7 for code generation and library documentation.

## Project Overview

klink is an MCP (Model Context Protocol) server built with Bun that provides AI assistants access to productivity tools (Jira, GitHub, Slack, Telegram, Quip, PocketBase).

- **Runtime:** Bun (use `bun` instead of `node`, `npm`, `npx`)
- **Framework:** `@modelcontextprotocol/sdk`
- **Validation:** Zod for input schemas
- **Architecture:** Modular design with singleton services

## Module Structure

Each integration follows this structure:

```
src/{module}/
├── services/
│   └── external/
│       └── {module}.service.ts    # API client (singleton)
└── tools/
    ├── index.ts                   # Registers all tools for this module
    ├── {action}-{resource}.tool.ts
    └── ...
```

### Core Utilities

```
src/core/
├── service/
│   ├── env.service.ts             # EnvService.getRequiredEnv()
│   ├── file.service.ts            # Temporary file output
│   └── module-config.service.ts   # --include/--exclude parsing
└── utils/
    ├── http.utils.ts              # makeError() for HTTP responses
    └── tool.utils.ts              # Handler wrappers
```

## Coding Conventions

### Class Organization

Place exported classes at the top of the file, un-exported classes below:

```typescript
// Exported singleton getter first
export const getJiraService = (): JiraService => {
  if (!instance) instance = new JiraService();
  return instance;
};

// Exported class
export class JiraService {
  // ...
}

// Un-exported types at bottom
type JiraClientConfig = {
  host: string;
  apiToken: string;
};
```

### Singleton Services

All external service clients use the singleton pattern:

```typescript
let instance: MyService;

export const getMyService = (): MyService => {
  if (!instance) instance = new MyService();
  return instance;
};
```

### Handler Wrappers

Tool handlers always use this wrapper pattern:

```typescript
server.registerTool(
  "module_action_resource",
  { description, inputSchema },
  withErrorHandling(           // Always outermost
    withTemporaryTextOutput(   // For get/search/list (writes to temp file)
      "module",
      "action-resource",
      async (args) => {
        const service = getMyService();
        const result = await service.doSomething(args);
        return JSON.stringify(result, null, 2);
      }
    )
  )
);
```

**Wrapper selection:**

| Operation Type | Wrapper |
|----------------|---------|
| `get_*`, `search_*`, `list_*` | `withTemporaryTextOutput` |
| `create_*`, `update_*`, `delete_*`, `add_*` | `withTextOutput` |

### Error Handling

Do NOT catch errors in handlers. Let them propagate to `withErrorHandling`:

```typescript
// ❌ Bad
async (args) => {
  try {
    return await service.doSomething(args);
  } catch (e) {
    return "Error: " + e.message;
  }
}

// ✅ Good
async (args) => {
  return await service.doSomething(args);
}
```

For custom error messages, throw descriptive errors:

```typescript
if (!result) {
  throw new Error(
    `Issue ${issueIdOrKey} not found. Verify the key exists and you have permission.`
  );
}
```

## Naming Conventions

### Tool Names

Format: `{module}_{action}_{resource}` in `snake_case`

| Pattern | Examples |
|---------|----------|
| `{module}_get_{resource}` | `jira_get_issue`, `slack_get_user` |
| `{module}_search_{resources}` | `jira_search_issues`, `quip_search_documents` |
| `{module}_list_{resources}` | `slack_list_channels` |
| `{module}_create_{resource}` | `quip_create_document` |
| `{module}_add_{resource}` | `slack_add_reaction`, `github_add_pr_comment` |

### File Names

Format: `{action}-{resource}.tool.ts` in `kebab-case`

Examples:
- `get-issue.tool.ts`
- `search-issues.tool.ts`
- `add-pr-comment.tool.ts`

### Parameters

Use `camelCase` for parameter names:

```typescript
const inputSchema = {
  issueIdOrKey: z.string().describe("..."),
  maxResults: z.number().default(50).describe("..."),
};
```

## Adding New Tools

1. Read the guidelines:
   - [how-to-write-mcp-tool-description.md](docs/guidelines/how-to-write-mcp-tool-description.md)
   - [how-to-write-mcp-tool-handler.md](docs/guidelines/how-to-write-mcp-tool-handler.md)

2. Create the tool file: `src/{module}/tools/{action}-{resource}.tool.ts`

3. Register in `src/{module}/tools/index.ts`

4. Add service method if needed in `src/{module}/services/external/{module}.service.ts`

5. Update documentation:
   - Add tool to `README.md` in "Available Tools" section

## Adding New Integrations

1. Create module structure:
   ```
   src/{new-module}/
   ├── services/external/{new-module}.service.ts
   └── tools/
       ├── index.ts
       └── {first-tool}.tool.ts
   ```

2. Add environment variables in the service constructor using `EnvService.getRequiredEnv()`

3. Register in `src/index.ts`:
   ```typescript
   import { registerNewModuleTools } from "./{new-module}/tools";
   
   if (moduleConfig.isEnabled("{new-module}")) registerNewModuleTools(server);
   ```

4. Update documentation:
   - Add to `README.md`: Features table, Environment variables, Tools list
   - Add to `CLAUDE.md`: Project Overview, Module Structure diagram

## Testing

Test tools via stdio with JSON-RPC:

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"jira_get_issue","arguments":{"issueIdOrKey":"PROJ-123"}}}
EOF
```

## Commands

```bash
bun install          # Install dependencies
bun run src/index.ts # Run in development
bun run lint         # Check linting
bun run lint:fix     # Fix linting issues
bun build --compile --minify src/index.ts --outfile klink  # Build binary
```
