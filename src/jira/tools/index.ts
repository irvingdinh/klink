import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerSearchIssuesTool } from "./search-issues.tool.ts";

export const registerJiraTools = (server: McpServer) => {
  registerSearchIssuesTool(server);
};
