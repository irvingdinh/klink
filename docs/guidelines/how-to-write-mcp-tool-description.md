# How to Write MCP Tool Descriptions

A comprehensive guide for writing effective MCP (Model Context Protocol) tool definitions that help AI agents understand and use your tools correctly.

## Why Tool Descriptions Matter

AI agents rely **entirely** on your tool's metadata to decide:
- **When** to use a tool (tool description)
- **How** to use it (input schema with parameter descriptions)
- **What to expect** (output format hints in description)

Poor descriptions lead to:
- AI using the wrong tool for a task
- Incorrect parameter values passed to tools
- Repeated failed attempts with unhelpful errors
- User frustration and wasted tokens

**The description is not documentation for humans—it's an instruction manual for the AI.**

---

## Anatomy of a Well-Defined Tool

Every MCP tool consists of three core components:

```typescript
server.registerTool(
  "tool_name",           // 1. Name - unique identifier
  {
    description: "...",  // 2. Description - tells AI when/how to use it
    inputSchema: {...},  // 3. Input Schema - defines parameters
  },
  handler                // Implementation (not covered here)
);
```

### Example from klink: `jira_search_issues`

```typescript
// src/jira/tools/search-issues.tool.ts

const inputSchema = {
  jql: z
    .string()
    .describe(
      "JQL (Jira Query Language) query string to search for issues. Example: 'project = PROJ AND status = Open'"
    ),
  startAt: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Index of the first result to return (0-based pagination)"),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of results to return (1-100)"),
  // ...
};

server.registerTool(
  "jira_search_issues",
  {
    description:
      "Search for JIRA issues using JQL (Jira Query Language). Use this when you need to find issues by criteria; use jira_get_issue if you already know the specific issue key/ID. Returns matching issues with their details. Results are written to a temporary file and the file path is returned.",
    inputSchema,
  },
  handler
);
```

---

## Writing Effective Tool Descriptions

### The Three Essential Questions

A good tool description answers:

1. **What does this tool do?** (primary action)
2. **When should the AI use it?** (use case context)
3. **What does it return?** (output format)

### Formula for Writing Descriptions

```
[Action verb] + [what it operates on] + [key context/constraints] + [output format]
```

### Good vs Bad Examples

#### Example 1: Get Issue Tool

| Bad | Good |
|-----|------|
| `"Gets a Jira issue"` | `"Get a single JIRA issue by its ID or key (e.g., 'PROJ-123'). Use this when you already know the specific issue key/ID; use jira_search_issues when you need to find issues by criteria. Results are written to a temporary file and the file path is returned."` |

**Why it's better:**
- Specifies "single" (clarifies it's not a bulk operation)
- Mentions "ID or key" with inline example (tells AI both input formats work)
- Cross-references related tool (helps AI choose the right tool)
- Explains the output format (file path, not raw data)

#### Example 2: Search Tool

| Bad | Good |
|-----|------|
| `"Search issues"` | `"Search for JIRA issues using JQL (Jira Query Language). Use this when you need to find issues by criteria; use jira_get_issue if you already know the specific issue key/ID. Returns matching issues with their details. Results are written to a temporary file and the file path is returned."` |

**Why it's better:**
- Names the query language (JQL) explicitly
- AI now knows it needs to construct JQL syntax
- Cross-references related tool (helps AI choose the right tool)
- Clarifies what "matching issues" means (with details)

### Description Writing Checklist

- [ ] Starts with an action verb (Get, Search, Create, Update, Delete, List)
- [ ] Specifies the resource/entity being operated on
- [ ] Mentions any required format or syntax (e.g., JQL, regex, date format)
- [ ] Describes what the tool returns
- [ ] Includes constraints if applicable (e.g., "max 100 results")
- [ ] Differentiates from similar tools if multiple exist

### Advanced: Contextual Hints

Include hints that help AI decide **when** to use a tool:

```typescript
description:
  "Search for JIRA issues when the user wants to find multiple issues " +
  "matching certain criteria. Use jira_get_issue instead if the user " +
  "already knows the specific issue key."
```

This pattern is used by Laravel Boost for tools like:
- **Database Query** vs **Database Schema** — clarifies when to use each
- **Get Config** vs **List Available Config Keys** — clarifies discovery vs retrieval

---

## Designing Input Schemas

### Principle: Every Parameter Tells a Story

Each parameter description should answer:
1. **What is this?** (semantic meaning)
2. **What format?** (syntax expectations)
3. **Example value** (reduces ambiguity)

### Pattern: Description + Example

```typescript
jql: z
  .string()
  .describe(
    "JQL (Jira Query Language) query string to search for issues. " +
    "Example: 'project = PROJ AND status = Open'"
  ),
```

### Pattern: Explain Defaults

```typescript
fields: z
  .string()
  .default("summary,issuetype,status,priority,assignee,reporter,created,updated,project")
  .describe(
    "Comma-separated list of fields to include in the response. " +
    "Defaults to common fields. Use '*all' for all fields or '*navigable' for navigable fields."
  ),
```

### Pattern: Constrained Values with Enum

```typescript
priority: z
  .enum(["highest", "high", "medium", "low", "lowest"])
  .describe("Issue priority level"),
```

### Pattern: Numeric Ranges

```typescript
maxResults: z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(50)
  .describe("Maximum number of results to return (1-100)"),
```

### Required vs Optional Parameters

**Required parameters:**
- Don't have a `.default()` or `.optional()`
- Must be marked as required in the schema
- Should be truly essential for the tool to function

**Optional parameters:**
- Should have sensible defaults
- Describe what happens when omitted
- Don't burden the AI with unnecessary decisions

### Parameter Description Template

```
[What this parameter is] + [format/syntax if applicable] + [example if helpful] + [default behavior if optional]
```

Examples:
- `"The ID or key of the issue to retrieve. Example: 'PROJ-123' or '10001'"`
- `"Index of the first result to return (0-based pagination)"`
- `"Comma-separated list of expand options for additional issue data"`

---

## Naming Conventions

### Tool Names

| Rule | Example | Rationale |
|------|---------|-----------|
| Use `snake_case` | `jira_get_issue` | Standard in MCP ecosystem |
| Prefix with domain/service | `jira_`, `github_`, `slack_` | Groups related tools, avoids collisions |
| Use action verbs | `get_`, `search_`, `create_`, `update_`, `delete_`, `list_` | Indicates the operation type |
| Be specific | `jira_get_issue` not `jira_issue` | Avoids ambiguity about the action |

### Common Action Prefixes

| Prefix | When to Use |
|--------|-------------|
| `get_` | Retrieve a single item by ID/key |
| `list_` | Retrieve multiple items (enumeration) |
| `search_` | Query-based retrieval with filters |
| `create_` | Create a new resource |
| `update_` | Modify an existing resource |
| `delete_` | Remove a resource |
| `validate_` | Check validity without side effects |
| `execute_` | Run a command or script |

### Parameter Names

| Rule | Good | Bad |
|------|------|-----|
| Use `camelCase` | `issueIdOrKey` | `issue_id_or_key`, `IssueIdOrKey` |
| Be descriptive | `maxResults` | `max`, `n`, `limit` |
| Match domain terminology | `jql` (Jira Query Language) | `query`, `q`, `search` |
| Avoid abbreviations | `startAt` | `start`, `offset` |

---

## Error Handling

### Principle: Errors are Instructions

When a tool fails, the error message should tell the AI **how to fix it**.

### Pattern: Actionable Error Messages

```typescript
// Bad
throw new Error("Invalid JQL");

// Good
throw new Error(
  "Invalid JQL query syntax. Ensure the query follows Jira Query Language format. " +
  "Example: 'project = PROJ AND status = Open'. " +
  "Common issues: unquoted strings, invalid field names, missing operators."
);
```

### Pattern: Validation with Guidance

Laravel MCP approach:
```typescript
const validated = request.validate({
  'location': 'required|string|max:100',
}, {
  'location.required':
    'You must specify a location to get the weather for. ' +
    'For example, "New York City" or "Tokyo".',
});
```

### Error Response Structure

Return errors in a consistent format:
```typescript
return {
  content: [{
    type: "text",
    text: "Error: [specific error message with guidance]"
  }],
  isError: true
};
```

### Common Error Scenarios to Handle

1. **Missing required parameters** — List what's missing and show example values
2. **Invalid format** — Show expected format with example
3. **Resource not found** — Confirm the identifier and suggest alternatives
4. **Permission denied** — Explain what permission is needed
5. **Rate limited** — Suggest waiting or reducing request size

---

## Anti-Patterns to Avoid

### 1. Vague Descriptions

```typescript
// Bad
description: "Handles Jira stuff"

// Good
description: "Get a single JIRA issue by its ID or key (e.g., 'PROJ-123'). Use this when you already know the specific issue key/ID; use jira_search_issues when you need to find issues by criteria. Results are written to a temporary file and the file path is returned."
```

**Why it's bad:** AI has no idea when to use this tool or what it returns.

### 2. Missing Parameter Examples

```typescript
// Bad
jql: z.string().describe("JQL query"),

// Good
jql: z.string().describe(
  "JQL (Jira Query Language) query string to search for issues. " +
  "Example: 'project = PROJ AND status = Open'"
),
```

**Why it's bad:** AI might not know JQL syntax; example teaches by demonstration.

### 3. Ambiguous Parameter Types

```typescript
// Bad
id: z.string().describe("The ID"),

// Good
issueIdOrKey: z.string().describe(
  "The ID or key of the issue to retrieve. Example: 'PROJ-123' or '10001'"
),
```

**Why it's bad:** "ID" is ambiguous—is it numeric? A key? A UUID?

### 4. Missing Constraints in Description

```typescript
// Bad
maxResults: z.number().describe("Number of results"),

// Good
maxResults: z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(50)
  .describe("Maximum number of results to return (1-100)"),
```

**Why it's bad:** AI might request 10,000 results if limits aren't stated.

### 5. Unhelpful Error Messages

```typescript
// Bad
throw new Error("Failed");

// Good
throw new Error(
  "Issue PROJ-123 not found. Verify the issue key exists and you have permission to view it."
);
```

**Why it's bad:** AI learns nothing and will likely retry with the same mistake.

### 6. Duplicate Functionality Without Differentiation

```typescript
// Bad: Two tools with unclear differences
"jira_get_issues"      // description: "Gets issues"
"jira_fetch_issues"    // description: "Fetches issues"

// Good: Clear differentiation
"jira_get_issue"       // description: "Get a single JIRA issue by its ID or key..."
"jira_search_issues"   // description: "Search for JIRA issues using JQL..."
```

**Why it's bad:** AI will randomly choose between tools, often incorrectly.

### 7. Overloaded Tools

```typescript
// Bad: One tool doing too much
"jira_manage_issue"  // can get, create, update, delete based on "action" parameter

// Good: Single responsibility
"jira_get_issue"
"jira_create_issue"
"jira_update_issue"
"jira_delete_issue"
```

**Why it's bad:** Complex branching logic is harder for AI to reason about.

---

## Quick Reference Card

### Tool Description Template

```
[Action verb] [target resource] [using method/syntax]. [Output format]. [Differentiator from similar tools if needed].
```

### Parameter Description Template

```
[What it is]. [Format/syntax]. [Example]. [Default behavior].
```

### Naming Checklist

- [ ] Tool name: `{domain}_{action}_{resource}` in `snake_case`
- [ ] Parameter names: `camelCase`, descriptive, no abbreviations
- [ ] Action prefix matches operation: `get_`, `list_`, `search_`, `create_`, `update_`, `delete_`

### Description Checklist

- [ ] Starts with action verb
- [ ] Names the resource/entity
- [ ] Mentions format/syntax requirements
- [ ] Explains output format
- [ ] Differentiates from similar tools

### Input Schema Checklist

- [ ] Every parameter has a `.describe()`
- [ ] Examples provided for complex formats
- [ ] Constraints (min/max/enum) are explicit
- [ ] Defaults are sensible and documented
- [ ] Required vs optional is intentional

### Error Handling Checklist

- [ ] Errors explain what went wrong
- [ ] Errors suggest how to fix it
- [ ] Examples provided when format is wrong
- [ ] Consistent error structure across tools

---

## References

- [MCP Server Concepts: Tools](https://modelcontextprotocol.io/docs/learn/server-concepts#tools)
- [Laravel MCP Documentation](https://laravel.com/docs/12.x/mcp)
- [Laravel Boost MCP Server](https://github.com/laravel/boost)
- [Laravel MCP Package](https://github.com/laravel/mcp)
