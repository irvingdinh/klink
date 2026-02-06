# How to Write MCP Tool Handlers

A step-by-step guide for implementing MCP tool handlers in klinklang. Read this before implementing any new tool.

## Handler Architecture

Every handler follows this structure:

```typescript
server.registerTool(
  "tool_name",
  { description, inputSchema },
  withErrorHandling(        // Always outermost
    withXxxOutput(          // Output wrapper (choose one)
      async (args, extra) => {
        // Your implementation
        return "string result";
      }
    )
  )
);
```

### Key Principles

1. **`withErrorHandling` is always the outermost wrapper** — ensures consistent error format
2. **Inner handler returns `string`** — wrappers handle `CallToolResult` formatting

---

## Step-by-Step Implementation

### Step 1: Choose the Output Wrapper

| Use Case | Wrapper | When to Use |
|----------|---------|-------------|
| Large data responses | `withTemporaryTextOutput` | Get/Search operations returning JSON data that AI may grep, scan, or delegate |
| Simple confirmations | `withTextOutput` | Create/Update/Delete confirmations, status messages, small responses |

#### `withTemporaryTextOutput(moduleRef, toolRef, handler)`

Writes output to a temp file and returns the file path. AI can then read, grep, or delegate the file.

```typescript
// src/jira/tools/get-issue.tool.ts

withErrorHandling(
  withTemporaryTextOutput(
    "jira",       // moduleRef: matches src/jira/
    "get-issue",  // toolRef: matches tool name jira_get_issue
    async ({ issueIdOrKey, fields, expand }) => {
      const jiraService = getJiraService();
      const issue = await jiraService.getIssue({ issueIdOrKey, fields, expand });
      return JSON.stringify(issue, null, 2);
    }
  )
)
```

#### `withTextOutput(handler)`

Returns text directly to the MCP client. Use for simple, short responses.

```typescript
// Example: create issue tool

withErrorHandling(
  withTextOutput(
    async ({ projectKey, summary, description }) => {
      const jiraService = getJiraService();
      const issue = await jiraService.createIssue({ projectKey, summary, description });
      return `Created issue ${issue.key}: ${issue.self}`;
    }
  )
)
```

### Step 2: Naming Conventions

| Parameter | Convention | Example |
|-----------|------------|---------|
| `moduleRef` | Matches directory under `src/` | `"jira"` for `src/jira/` |
| `toolRef` | Matches tool name (kebab-case) | `"get-issue"` from `jira_get_issue` |

These are used for temp file naming: `{moduleRef}-{toolRef}-{uuid}.txt`

### Step 3: Implement the Inner Handler

The inner handler receives:
- `args` — validated input from the schema
- `extra` — MCP request context (rarely needed)

```typescript
async ({ issueIdOrKey, fields, expand }, extra) => {
  // 1. Get service instance
  const jiraService = getJiraService();
  
  // 2. Call service method
  const issue = await jiraService.getIssue({ issueIdOrKey, fields, expand });
  
  // 3. Return string (wrapper handles CallToolResult)
  return JSON.stringify(issue, null, 2);
}
```

#### Large Text Input Support

For tools that accept text content (e.g., document content, messages), support both:
- **Direct text** via the parameter (e.g., `content`, `text`)
- **File path** via a `{param}File` parameter (e.g., `contentFile`, `textFile`)

This allows AI agents to handle large content by writing to a temp file first.

**Input Schema Pattern:**

```typescript
import { getTempDir, resolveContent } from "../../core/utils/tool.utils.ts";

const inputSchema = {
  content: z
    .string()
    .optional()
    .describe("The content in Markdown format. Example: '# Heading\\n\\nText here.'"),
  contentFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the content. Use this for large content. ` +
      `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`
    ),
};
```

**Handler Pattern:**

```typescript
async ({ content, contentFile, ...rest }) => {
  // resolveContent handles mutual exclusivity and file reading
  const resolvedContent = await resolveContent(content, contentFile, "content");
  
  // Use resolvedContent in your service call
  await service.doSomething({ content: resolvedContent, ...rest });
}
```

**Naming Convention:**

| Text Param | File Param |
|------------|------------|
| `content` | `contentFile` |
| `text` | `textFile` |
| `comment` | `commentFile` |

### Step 4: Error Handling

**Do NOT catch errors in your handler.** Let them propagate to `withErrorHandling`.

```typescript
// ❌ Bad: Manual error handling
async (args) => {
  try {
    const result = await service.doSomething(args);
    return JSON.stringify(result);
  } catch (error) {
    return { content: [{ type: "text", text: error.message }], isError: true };
  }
}

// ✅ Good: Let withErrorHandling handle it
async (args) => {
  const result = await service.doSomething(args);
  return JSON.stringify(result);
}
```

For custom error messages, throw a descriptive Error:

```typescript
async ({ issueIdOrKey }) => {
  const issue = await jiraService.getIssue({ issueIdOrKey });
  
  if (!issue) {
    throw new Error(
      `Issue ${issueIdOrKey} not found. Verify the issue key exists and you have permission to view it.`
    );
  }
  
  return JSON.stringify(issue, null, 2);
}
```

---

## Complete Example

Here's the full implementation of `jira_get_issue`:

```typescript
// src/jira/tools/get-issue.tool.ts

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getJiraService } from "../services/external/jira.service.ts";

const inputSchema = {
  issueIdOrKey: z
    .string()
    .describe(
      "The ID or key of the issue to retrieve. Example: 'PROJ-123' or '10001'",
    ),
  fields: z
    .string()
    .default("*navigable")
    .describe(
      "Comma-separated list of field IDs to return. Defaults to '*navigable'. Use '*all' for all fields.",
    ),
  expand: z
    .string()
    .default("renderedFields,names,changelog")
    .describe(
      "Comma-separated list of entities to expand. Defaults to 'renderedFields,names,changelog'.",
    ),
};

export const registerGetIssueTool = (server: McpServer) => {
  server.registerTool(
    "jira_get_issue",
    {
      description:
        "Get a single JIRA issue by its ID or key (e.g., 'PROJ-123'). Use this when you already know the specific issue key/ID; use jira_search_issues when you need to find issues by criteria. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "jira",
        "get-issue",
        async ({ issueIdOrKey, fields, expand }) => {
          const jiraService = getJiraService();
          const issue = await jiraService.getIssue({
            issueIdOrKey,
            fields,
            expand,
          });
          
          return JSON.stringify(issue, null, 2);
        },
      ),
    ),
  );
};
```

---

## Anti-Patterns

### ❌ Not Using Wrappers

```typescript
// Bad: No wrappers, manual everything
server.registerTool("my_tool", { description, inputSchema },
  async (args) => {
    try {
      const result = await doSomething(args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (e) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);
```

**Why it's bad:** Repetitive boilerplate, inconsistent error format, no file output for large responses.

### ❌ Wrong Wrapper Order

```typescript
// Bad: withTemporaryTextOutput outside withErrorHandling
withTemporaryTextOutput("mod", "tool",
  withErrorHandling(async (args) => { ... })
)
```

**Why it's bad:** Errors won't be caught properly, may cause unhandled rejections.

### ❌ Catching Errors Inside Handler

```typescript
// Bad: Catching and returning custom error format
async (args) => {
  try {
    return await doSomething(args);
  } catch (e) {
    return "Error: " + e.message;  // Not an error response!
  }
}
```

**Why it's bad:** `withErrorHandling` won't know it's an error. Return value looks like success.

---

## Quick Reference

### Wrapper Import

```typescript
import {
  withErrorHandling,
  withTextOutput,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
```

### Wrapper Selection

| Operation Type | Wrapper |
|----------------|---------|
| `get_*`, `search_*`, `list_*` | `withTemporaryTextOutput` |
| `create_*`, `update_*`, `delete_*` | `withTextOutput` |

### Handler Checklist

- [ ] `withErrorHandling` is the outermost wrapper
- [ ] Chose correct output wrapper for the operation type
- [ ] `moduleRef` matches `src/{module}/` directory
- [ ] `toolRef` matches tool name in kebab-case
- [ ] Inner handler returns `string`
- [ ] No try/catch in inner handler (let errors propagate)
- [ ] Uses service singleton (`getXxxService()`)
- [ ] JSON responses use `JSON.stringify(data, null, 2)`
- [ ] Write tools with text input support both direct text and `{param}File` alternative
