import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getTelegramService } from "../services/external/telegram.service.ts";

const inputSchema = {
  chatId: z
    .union([z.string(), z.number()])
    .describe(
      "The unique identifier for the target chat or username of the target supergroup or channel. " +
        "Example: 123456789 or '@mychannel'",
    ),
};

export const registerGetChatTool = (server: McpServer) => {
  server.registerTool(
    "telegram_get_chat",
    {
      description:
        "Get information about a Telegram chat by its ID or username. " +
        "Returns chat type, title, description, and other metadata. " +
        "Works for private chats, groups, supergroups, and channels. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("telegram", "get-chat", async ({ chatId }) => {
        const telegramService = getTelegramService();
        const result = await telegramService.getChat({ chatId });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
