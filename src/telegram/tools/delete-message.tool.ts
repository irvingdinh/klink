import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getTelegramService } from "../services/external/telegram.service.ts";

const inputSchema = {
  chatId: z
    .union([z.string(), z.number()])
    .describe(
      "The unique identifier for the target chat or username of the target channel. " +
        "Example: 123456789 or '@mychannel'",
    ),
  messageId: z
    .number()
    .int()
    .describe("The message ID of the message to delete. Example: 123"),
};

export const registerDeleteMessageTool = (server: McpServer) => {
  server.registerTool(
    "telegram_delete_message",
    {
      description:
        "Delete a message from a Telegram chat. " +
        "Bots can delete outgoing messages in private chats, groups, and supergroups. " +
        "Bots can delete incoming messages in private chats. " +
        "Bots with can_delete_messages permission can delete any message in groups and supergroups. " +
        "Returns true on success.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ chatId, messageId }) => {
        const telegramService = getTelegramService();
        const result = await telegramService.deleteMessage({
          chatId,
          messageId,
        });

        return JSON.stringify({ ok: true, deleted: result }, null, 2);
      }),
    ),
  );
};
