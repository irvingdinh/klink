import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
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
    .describe("The message ID of the message to edit. Example: 123"),
  text: z
    .string()
    .optional()
    .describe(
      "The new text for the message. Supports Markdown or HTML formatting if parseMode is specified.",
    ),
  textFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the new message text. Use this for large messages. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  parseMode: z
    .enum(["HTML", "Markdown", "MarkdownV2"])
    .optional()
    .describe(
      "Mode for parsing entities in the message text. " +
        "Use 'HTML' for HTML tags, 'Markdown' for legacy Markdown, or 'MarkdownV2' for extended Markdown.",
    ),
};

export const registerUpdateMessageTool = (server: McpServer) => {
  server.registerTool(
    "telegram_update_message",
    {
      description:
        "Edit an existing text message in a Telegram chat. " +
        "Only text messages can be edited (not photos, documents, etc.). " +
        "Requires the message_id from the original message. " +
        "Use telegram_send_message to send new messages. " +
        "Returns the edited message details.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ chatId, messageId, text, textFile, parseMode }) => {
          const resolvedText = await resolveContent(text, textFile, "text");

          const telegramService = getTelegramService();
          const result = await telegramService.editMessageText({
            chatId,
            messageId,
            text: resolvedText,
            parseMode,
          });

          return JSON.stringify(
            {
              ok: true,
              message_id: result.message_id,
              chat_id: result.chat.id,
              date: result.date,
            },
            null,
            2,
          );
        },
      ),
    ),
  );
};
