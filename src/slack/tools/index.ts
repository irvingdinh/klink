import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAddReactionTool } from "./add-reaction.tool.ts";
import { registerDownloadFileTool } from "./download-file.tool.ts";
import { registerGetConversationHistoryTool } from "./get-conversation-history.tool.ts";
import { registerGetThreadRepliesTool } from "./get-thread-replies.tool.ts";
import { registerGetUserTool } from "./get-user.tool.ts";
import { registerListChannelsTool } from "./list-channels.tool.ts";
import { registerSendMessageTool } from "./send-message.tool.ts";
import { registerUpdateMessageTool } from "./update-message.tool.ts";
import { registerUploadFileTool } from "./upload-file.tool.ts";

export const registerSlackTools = (server: McpServer) => {
  registerAddReactionTool(server);
  registerDownloadFileTool(server);
  registerGetConversationHistoryTool(server);
  registerGetThreadRepliesTool(server);
  registerGetUserTool(server);
  registerListChannelsTool(server);
  registerSendMessageTool(server);
  registerUpdateMessageTool(server);
  registerUploadFileTool(server);
};
