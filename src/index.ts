import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getModuleConfigService } from "./core/service/module-config.service.ts";
import { registerGithubTools } from "./github/tools";
import { registerJiraTools } from "./jira/tools";
import { registerQuipTools } from "./quip/tools";
import { registerSlackTools } from "./slack/tools";

const server = new McpServer({
  name: "klink",
  version: "1.0.0",
});

const moduleConfig = getModuleConfigService();
if (moduleConfig.isEnabled("github")) registerGithubTools(server);
if (moduleConfig.isEnabled("jira")) registerJiraTools(server);
if (moduleConfig.isEnabled("quip")) registerQuipTools(server);
if (moduleConfig.isEnabled("slack")) registerSlackTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
