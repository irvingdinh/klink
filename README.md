# klink

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To build:

```bash
bun build --compile --minify src/index.ts --outfile klink
```

This project was created using `bun init` in bun v1.2.20. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Instruction

* When writing MCP tool description, input schema, etc. read: docs/guidelines/how-to-write-mcp-tool-description.md
* When implementing MCP tool handler, logic, etc. read: docs/guidelines/how-to-write-mcp-tool-handler.md

## Testing

You can test MCP tools via stdio using JSON-RPC messages. Here's an example:

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"jira_get_issue","arguments":{"issueIdOrKey":"PROJ-123"}}}
EOF
```

## Setup

### OpenAI Codex CLI

```bash 
codex mcp add klink -- sh -c "cd $HOME/Workspace/github.com/irvingdinh/klink && ./klink"
```
