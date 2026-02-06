import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getModuleConfigService } from "./core/service/module-config.service.ts";
import { registerGithubTools } from "./github/tools";
import { registerJiraTools } from "./jira/tools";
import { registerPocketbaseTools } from "./pocketbase/tools";
import { registerQuipTools } from "./quip/tools";
import { registerReplicateTools } from "./replicate/tools";
import { registerSlackTools } from "./slack/tools";
import { registerTelegramTools } from "./telegram/tools";

const server = new McpServer({
  name: "klinklang",
  version: "1.0.0",
});

const moduleConfig = getModuleConfigService();
if (moduleConfig.isEnabled("github")) registerGithubTools(server);
if (moduleConfig.isEnabled("jira")) registerJiraTools(server);
if (moduleConfig.isEnabled("quip")) registerQuipTools(server);
if (moduleConfig.isEnabled("slack")) registerSlackTools(server);
if (moduleConfig.isEnabled("telegram")) registerTelegramTools(server);
if (moduleConfig.isEnabled("pocketbase")) registerPocketbaseTools(server);
if (moduleConfig.isEnabled("replicate")) registerReplicateTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
