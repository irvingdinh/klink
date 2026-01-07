import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGenerateImageTool } from "./generate-image.tool.ts";

export const registerReplicateTools = (server: McpServer) => {
  registerGenerateImageTool(server);
};
