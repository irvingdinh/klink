
---

## Installation (Linux)

### 1. Download

```bash
mkdir -p "$HOME/Workspace/github.com/irvingdinh/klink/releases/tag/{{VERSION}}"

# Download with wget
wget -O "$HOME/Workspace/github.com/irvingdinh/klink/releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64" "https://github.com/irvingdinh/klink/releases/download/{{VERSION}}/klink-{{VERSION}}-linux-x64"

# OR with curl
# curl -L -o "$HOME/Workspace/github.com/irvingdinh/klink/releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64" "https://github.com/irvingdinh/klink/releases/download/{{VERSION}}/klink-{{VERSION}}-linux-x64"

chmod a+x "$HOME/Workspace/github.com/irvingdinh/klink/releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64"
```

### 2. Configure Clients

**Claude Code**

```bash
claude mcp remove klink
claude mcp add klink -- sh -c "cd $HOME/Workspace/github.com/irvingdinh/klink && ./releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64"
```

**OpenAI Codex CLI**

```bash
codex mcp remove klink
codex mcp add klink -- sh -c "cd $HOME/Workspace/github.com/irvingdinh/klink && ./releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64"
```

**Gemini CLI**

```bash
gemini mcp remove klink
gemini mcp add klink -- sh -c "cd $HOME/Workspace/github.com/irvingdinh/klink && ./releases/tag/{{VERSION}}/klink-{{VERSION}}-linux-x64"
```
