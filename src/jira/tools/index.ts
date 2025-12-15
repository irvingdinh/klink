import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetIssueTool } from "./get-issue.tool.ts";
import { registerSearchIssuesTool } from "./search-issues.tool.ts";

export const registerJiraTools = (server: McpServer) => {
  registerGetIssueTool(server);
  registerSearchIssuesTool(server);
};
