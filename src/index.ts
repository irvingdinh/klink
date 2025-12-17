import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerJiraTools } from "./jira/tools";
import { registerSlackTools } from "./slack/tools";

const server = new McpServer({
  name: "klink",
  version: "1.0.0",
});

registerJiraTools(server);
registerSlackTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
