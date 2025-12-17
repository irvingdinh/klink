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

### jira_search_issues

```
(
  printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"jira_search_issues","arguments":{"jql":"project = UAM"}}}'
) \
| bun run ./src/index.ts \
| jq .
```

### jira_get_issue

```
(
  printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
  sleep 1
  printf '%s\n' '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"jira_get_issue","arguments":{"issueIdOrKey":"UAM-1434"}}}'
) \
| bun run ./src/index.ts \
| jq .
```

### slack_get_conversation_history

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_get_conversation_history","arguments":{"conversationId":"C0A34EP68H5","limit":25}}}
EOF
```

### slack_get_thread_replies

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_get_thread_replies","arguments":{"conversationId":"C0A34EP68H5","threadTs":"1765870850.435779","limit":100}}}
EOF
```

### slack_send_message

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_send_message","arguments":{"channel":"C0A34EP68H5","text":"Hello from klink MCP!"}}}
EOF
```

### slack_update_message

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_update_message","arguments":{"channel":"C0A34EP68H5","ts":"MESSAGE_TS_HERE","text":"Updated message text"}}}
EOF
```

### slack_add_reaction

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_add_reaction","arguments":{"channel":"C0A34EP68H5","timestamp":"MESSAGE_TS_HERE","emoji":"white_check_mark"}}}
EOF
```

### slack_get_user

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_get_user","arguments":{"userId":"U0A3HSKQ52A"}}}
EOF
```

### slack_list_channels

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_list_channels","arguments":{"limit":100}}}
EOF
```

### slack_upload_file

```bash
echo "Test file content" > /tmp/test.txt
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"slack_upload_file","arguments":{"channel":"C0A34EP68H5","filePath":"/tmp/test.txt","filename":"test.txt"}}}
EOF
```

## Setup

### OpenAI Codex CLI

```bash 
codex mcp add klink -- sh -c "cd $HOME/Workspace/git.taservs.net/idinh/klink && ./klink"
```
