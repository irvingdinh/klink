# klink

A modular MCP (Model Context Protocol) server that connects your productivity tools to AI assistants. Seamlessly integrate Jira, GitHub, Slack, Telegram, Quip, Pocketbase, and Replicate into Claude, Cursor, and other MCP-compatible clients.

## Features

| Integration | Tools | Capabilities |
|-------------|-------|--------------|
| **Jira** | 2 | Get issues, search with JQL |
| **GitHub** | 4 | Pull requests, diffs, reviews, inline comments |
| **Slack** | 9 | Channels, messages, threads, reactions, file uploads/downloads |
| **Telegram** | 8 | Messages, files, reactions, chat info |
| **Quip** | 9 | Documents, folders, search, comments, editing |
| **Pocketbase** | 21 | Collections, records, settings, logs, files, auth |
| **Replicate** | 1 | AI image generation with Google nano-banana |

## Quick Start

Use klink directly via npx - no installation required:

```bash
npx klink@latest
```

Or install globally:

```bash
npm install -g klink
klink
```

## Configuration

### Environment Variables

#### Jira

| Variable | Required | Description |
|----------|----------|-------------|
| `JIRA_HOST` | Yes | Your Jira base URL (e.g., `https://your-org.atlassian.net`) |
| `JIRA_EMAIL_ADDRESS` | Yes | Email address for authentication |
| `JIRA_API_TOKEN` | Yes | [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens) |

#### GitHub

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_HOST` | Yes | `https://api.github.com` for GitHub.com, or your GitHub Enterprise URL (e.g., `https://github.mycompany.com`) |
| `GITHUB_API_TOKEN` | Yes | [Personal Access Token](https://github.com/settings/tokens) with `repo` scope |

#### Slack

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_API_TOKEN` | Yes | Bot token starting with `xoxb-`. Create a [Slack App](https://api.slack.com/apps) with appropriate scopes |

#### Telegram

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Token from [@BotFather](https://t.me/BotFather) |

#### Quip

| Variable | Required | Description |
|----------|----------|-------------|
| `QUIP_API_TOKEN` | Yes | [Personal API token](https://quip.com/dev/token) |

#### Pocketbase

| Variable | Required | Description |
|----------|----------|-------------|
| `POCKETBASE_HOST` | Yes | Your Pocketbase base URL (e.g., `https://pb.example.com`) |
| `POCKETBASE_ADMIN_EMAIL` | Yes | Superuser/admin email address |
| `POCKETBASE_ADMIN_PASSWORD` | Yes | Superuser/admin password |

#### Replicate

| Variable | Required | Description |
|----------|----------|-------------|
| `REPLICATE_API_TOKEN` | Yes | [API token](https://replicate.com/account/api-tokens) from Replicate |

### Module Selection

Control which modules are loaded using CLI options or environment variables:

| Method | Include | Exclude |
|--------|---------|---------|
| CLI | `--include jira,github` | `--exclude quip,slack` |
| Env | `KLINK_INCLUDE=jira,github` | `KLINK_EXCLUDE=quip,slack` |

```bash
# CLI examples
npx klink@latest -- --include jira,github
npx klink@latest -- --exclude quip,slack

# Environment variable examples
KLINK_INCLUDE=jira,github npx klink@latest
KLINK_EXCLUDE=quip,slack npx klink@latest
```

> **Priority:** Environment variables override CLI options if both are set.
> **Note:** `include` and `exclude` are mutually exclusive (regardless of source).

## Available Tools

### Jira

| Tool | Description |
|------|-------------|
| `jira_get_issue` | Get a single issue by ID or key (e.g., `PROJ-123`) |
| `jira_search_issues` | Search issues using JQL (Jira Query Language) |

### GitHub

| Tool | Description |
|------|-------------|
| `github_get_pull_request` | Get PR metadata, body, reviewers, and comments |
| `github_get_pr_diff` | Get the unified diff of all file changes |
| `github_add_pr_comment` | Add an inline review comment on a specific line |
| `github_submit_review` | Submit a review (approve, request changes, or comment) |

### Slack

| Tool | Description |
|------|-------------|
| `slack_list_channels` | List channels the bot has access to |
| `slack_get_conversation_history` | Get message history from a channel |
| `slack_get_thread_replies` | Get all replies in a thread |
| `slack_get_user` | Get user information by ID |
| `slack_send_message` | Send a message or thread reply |
| `slack_update_message` | Edit an existing message |
| `slack_add_reaction` | Add an emoji reaction to a message |
| `slack_upload_file` | Upload a local file to a channel or thread |
| `slack_download_file` | Download a file by its file ID |

### Telegram

| Tool | Description |
|------|-------------|
| `telegram_get_chat` | Get chat info by ID or username |
| `telegram_send_message` | Send a text message |
| `telegram_update_message` | Edit a text message |
| `telegram_delete_message` | Delete a message |
| `telegram_send_document` | Send a file/document |
| `telegram_send_photo` | Send a photo inline |
| `telegram_download_file` | Download a file by ID |
| `telegram_set_message_reaction` | React to a message |

### Quip

| Tool | Description |
|------|-------------|
| `quip_get_document` | Get document metadata and HTML content |
| `quip_get_folder` | Get folder metadata and children list |
| `quip_search_documents` | Search documents by keywords |
| `quip_list_recent` | List recently accessed documents |
| `quip_list_comments` | List comments on a document |
| `quip_create_document` | Create a new document |
| `quip_append_document` | Append or prepend content to a document |
| `quip_edit_document` | Edit a specific section of a document |
| `quip_add_comment` | Add a comment or inline annotation |

### Pocketbase

| Tool | Description |
|------|-------------|
| `pocketbase_list_collections` | List all collections with schemas |
| `pocketbase_get_collection` | Get a single collection by ID/name |
| `pocketbase_create_collection` | Create a new collection with schema |
| `pocketbase_update_collection` | Update collection schema/rules |
| `pocketbase_delete_collection` | Delete a collection and all records |
| `pocketbase_truncate_collection` | Delete all records, keep schema |
| `pocketbase_list_records` | List/search records with filtering |
| `pocketbase_get_record` | Get a single record by ID |
| `pocketbase_create_record` | Create a new record |
| `pocketbase_update_record` | Update an existing record |
| `pocketbase_delete_record` | Delete a record |
| `pocketbase_get_settings` | Get all app settings |
| `pocketbase_update_settings` | Update app settings |
| `pocketbase_test_s3` | Test S3 storage connection |
| `pocketbase_test_email` | Send test email |
| `pocketbase_list_logs` | List request logs |
| `pocketbase_get_log` | Get a single log entry |
| `pocketbase_get_log_stats` | Get aggregated log statistics |
| `pocketbase_get_file_url` | Generate file download URL |
| `pocketbase_generate_file_token` | Generate protected file token |
| `pocketbase_impersonate_user` | Generate impersonation token |

### Replicate

| Tool | Description |
|------|-------------|
| `replicate_generate_image` | Generate or edit images using Google's nano-banana model |

## Client Setup

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "klink": {
      "command": "npx",
      "args": ["-y", "klink@latest"],
      "env": {
        "JIRA_HOST": "https://your-org.atlassian.net",
        "JIRA_EMAIL_ADDRESS": "you@company.com",
        "JIRA_API_TOKEN": "your-token",
        "GITHUB_HOST": "https://api.github.com",
        "GITHUB_API_TOKEN": "ghp_your-token",
        "SLACK_API_TOKEN": "xoxb-your-token",
        "TELEGRAM_BOT_TOKEN": "your-bot-token",
        "QUIP_API_TOKEN": "your-token",
        "POCKETBASE_HOST": "https://pb.example.com",
        "POCKETBASE_ADMIN_EMAIL": "admin@example.com",
        "POCKETBASE_ADMIN_PASSWORD": "your-password",
        "REPLICATE_API_TOKEN": "r8_your-token"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project or global config):

```json
{
  "mcpServers": {
    "klink": {
      "command": "npx",
      "args": ["-y", "klink@latest", "--", "--exclude", "quip"],
      "env": {
        "JIRA_HOST": "https://your-org.atlassian.net",
        "JIRA_EMAIL_ADDRESS": "you@company.com",
        "JIRA_API_TOKEN": "your-token",
        "GITHUB_HOST": "https://api.github.com",
        "GITHUB_API_TOKEN": "ghp_your-token",
        "SLACK_API_TOKEN": "xoxb-your-token",
        "TELEGRAM_BOT_TOKEN": "your-bot-token",
        "POCKETBASE_HOST": "https://pb.example.com",
        "POCKETBASE_ADMIN_EMAIL": "admin@example.com",
        "POCKETBASE_ADMIN_PASSWORD": "your-password",
        "REPLICATE_API_TOKEN": "r8_your-token"
      }
    }
  }
}
```

### OpenAI Codex CLI

```bash
codex mcp add klink -- npx -y klink@latest
```

## Architecture

```
src/
├── index.ts                    # Entry point, module registration
├── core/
│   ├── service/
│   │   ├── env.service.ts      # Environment variable handling
│   │   ├── file.service.ts     # Temporary file output
│   │   └── module-config.service.ts  # --include/--exclude parsing
│   └── utils/
│       ├── http.utils.ts       # HTTP error formatting
│       └── tool.utils.ts       # Handler wrappers (withErrorHandling, etc.)
├── jira/
│   ├── services/external/      # Jira API client
│   └── tools/                  # jira_* tool definitions
├── github/
│   ├── services/external/      # GitHub API client
│   └── tools/                  # github_* tool definitions
├── slack/
│   ├── services/external/      # Slack Web API client
│   └── tools/                  # slack_* tool definitions
├── telegram/
│   ├── services/external/      # Telegram API client
│   └── tools/                  # telegram_* tool definitions
├── quip/
│   ├── services/external/      # Quip API client
│   └── tools/                  # quip_* tool definitions
├── pocketbase/
│   ├── services/external/      # Pocketbase API client
│   └── tools/                  # pocketbase_* tool definitions
└── replicate/
    ├── services/external/      # Replicate API client
    └── tools/                  # replicate_* tool definitions
```

## Development

### Setup

```bash
npm install
```

### Testing Tools

Test MCP tools via stdio using JSON-RPC messages:

```bash
cat << 'EOF' | node dist/index.js
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"jira_get_issue","arguments":{"issueIdOrKey":"PROJ-123"}}}
EOF
```

### Building

```bash
npm run build       # Build with tsup
```

### Guidelines

- **Writing tool descriptions:** See [docs/guidelines/how-to-write-mcp-tool-description.md](docs/guidelines/how-to-write-mcp-tool-description.md)
- **Implementing tool handlers:** See [docs/guidelines/how-to-write-mcp-tool-handler.md](docs/guidelines/how-to-write-mcp-tool-handler.md)

### Linting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

## License

MIT
