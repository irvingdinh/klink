import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAddCommentTool } from "./add-comment.tool.ts";
import { registerAppendDocumentTool } from "./append-document.tool.ts";
import { registerCreateDocumentTool } from "./create-document.tool.ts";
import { registerEditDocumentTool } from "./edit-document.tool.ts";
import { registerGetDocumentTool } from "./get-document.tool.ts";
import { registerGetFolderTool } from "./get-folder.tool.ts";
import { registerListCommentsTool } from "./list-comments.tool.ts";
import { registerListRecentTool } from "./list-recent.tool.ts";
import { registerSearchDocumentsTool } from "./search-documents.tool.ts";

export const registerQuipTools = (server: McpServer) => {
  // Read tools
  registerGetDocumentTool(server);
  registerGetFolderTool(server);
  registerSearchDocumentsTool(server);
  registerListRecentTool(server);
  registerListCommentsTool(server);

  // Write tools
  registerCreateDocumentTool(server);
  registerAppendDocumentTool(server);
  registerEditDocumentTool(server);
  registerAddCommentTool(server);
};
