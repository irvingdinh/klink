import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetPageTool } from "./get-page.tool.ts";
import { registerGetSpaceTool } from "./get-space.tool.ts";
import { registerListAttachmentsTool } from "./list-attachments.tool.ts";
import { registerListChildPagesTool } from "./list-child-pages.tool.ts";
import { registerListCommentsTool } from "./list-comments.tool.ts";
import { registerListSpacesTool } from "./list-spaces.tool.ts";
import { registerSearchPagesTool } from "./search-pages.tool.ts";

export const registerConfluenceTools = (server: McpServer) => {
  registerGetPageTool(server);
  registerGetSpaceTool(server);
  registerListAttachmentsTool(server);
  registerListChildPagesTool(server);
  registerListCommentsTool(server);
  registerListSpacesTool(server);
  registerSearchPagesTool(server);
};
