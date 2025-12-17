# klink

A modular MCP (Model Context Protocol) server that connects your productivity tools to AI assistants. Seamlessly integrate Jira, GitHub, Slack, and Quip into Claude, Cursor, and other MCP-compatible clients.

## Features

| Integration | Tools | Capabilities |
|-------------|-------|--------------|
| **Jira** | 2 | Get issues, search with JQL |
| **GitHub** | 4 | Pull requests, diffs, reviews, inline comments |
| **Slack** | 8 | Channels, messages, threads, reactions, file uploads |
| **Telegram** | 8 | Messages, files, reactions, chat info |
| **Quip** | 9 | Documents, folders, search, comments, editing |

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Create a `.env` file with credentials for the integrations you want to use:

```bash
# Jira
JIRA_HOST=https://your-org.atlassian.net
JIRA_EMAIL_ADDRESS=you@company.com
JIRA_API_TOKEN=your-atlassian-api-token

# GitHub
GITHUB_HOST=https://api.github.com
GITHUB_API_TOKEN=ghp_your-personal-access-token

# Slack
SLACK_API_TOKEN=xoxb-your-bot-token

# Telegram
TELEGRAM_BOT_TOKEN=123456789:AbC...

# Quip
QUIP_API_TOKEN=your-quip-api-token
```

### 3. Run

```bash
bun run src/index.ts
```

Or build a standalone binary:

```bash
bun build --compile --minify src/index.ts --outfile klink
./klink
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

### CLI Options

Control which modules are loaded at startup:

```bash
# Only enable specific modules
./klink --include jira,github

# Enable all except specific modules
./klink --exclude quip,slack
```

> **Note:** `--include` and `--exclude` are mutually exclusive.

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

## Client Setup

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "klink": {
      "command": "/path/to/klink",
      "env": {
        "JIRA_HOST": "https://your-org.atlassian.net",
        "JIRA_EMAIL_ADDRESS": "you@company.com",
        "JIRA_API_TOKEN": "your-token",
        "GITHUB_HOST": "https://api.github.com",
        "GITHUB_API_TOKEN": "ghp_your-token",
        "SLACK_API_TOKEN": "xoxb-your-token",
        "TELEGRAM_BOT_TOKEN": "your-bot-token",
        "QUIP_API_TOKEN": "your-token"
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
      "command": "/path/to/klink",
      "args": ["--exclude", "quip"],
      "env": {
        "JIRA_HOST": "https://your-org.atlassian.net",
        "JIRA_EMAIL_ADDRESS": "you@company.com",
        "JIRA_API_TOKEN": "your-token",
        "GITHUB_HOST": "https://api.github.com",
        "GITHUB_API_TOKEN": "ghp_your-token",
        "SLACK_API_TOKEN": "xoxb-your-token",
        "TELEGRAM_BOT_TOKEN": "your-bot-token"
      }
    }
  }
}
```

### OpenAI Codex CLI

```bash
codex mcp add klink -- sh -c "cd /path/to/klink && ./klink"
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
└── quip/
    ├── services/external/      # Quip API client
    └── tools/                  # quip_* tool definitions
```

## Development

### Testing Tools

Test MCP tools via stdio using JSON-RPC messages:

```bash
cat << 'EOF' | bun run ./src/index.ts
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"stdio-test","version":"0.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"jira_get_issue","arguments":{"issueIdOrKey":"PROJ-123"}}}
EOF
```

### Guidelines

- **Writing tool descriptions:** See [docs/guidelines/how-to-write-mcp-tool-description.md](docs/guidelines/how-to-write-mcp-tool-description.md)
- **Implementing tool handlers:** See [docs/guidelines/how-to-write-mcp-tool-handler.md](docs/guidelines/how-to-write-mcp-tool-handler.md)

### Linting

```bash
bun run lint        # Check for issues
bun run lint:fix    # Auto-fix issues
```

## License

MIT
