import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerDeleteMessageTool } from "./delete-message.tool.ts";
import { registerDownloadFileTool } from "./download-file.tool.ts";
import { registerGetChatTool } from "./get-chat.tool.ts";
import { registerSendDocumentTool } from "./send-document.tool.ts";
import { registerSendMessageTool } from "./send-message.tool.ts";
import { registerSendPhotoTool } from "./send-photo.tool.ts";
import { registerSetMessageReactionTool } from "./set-message-reaction.tool.ts";
import { registerUpdateMessageTool } from "./update-message.tool.ts";

export const registerTelegramTools = (server: McpServer) => {
  // Read tools
  registerGetChatTool(server);
  registerDownloadFileTool(server);

  // Write tools
  registerSendMessageTool(server);
  registerUpdateMessageTool(server);
  registerDeleteMessageTool(server);
  registerSendDocumentTool(server);
  registerSendPhotoTool(server);
  registerSetMessageReactionTool(server);
};
