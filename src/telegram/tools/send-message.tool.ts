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
      "The unique identifier for the target chat or username of the target channel (in the format @channelusername). " +
        "Example: 123456789 or '@mychannel'",
    ),
  text: z
    .string()
    .optional()
    .describe(
      "The message text to send. Supports Markdown or HTML formatting if parseMode is specified.",
    ),
  textFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the message text. Use this for large messages. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  replyToMessageId: z
    .number()
    .int()
    .optional()
    .describe(
      "If the message is a reply, the message ID of the original message.",
    ),
  parseMode: z
    .enum(["HTML", "Markdown", "MarkdownV2"])
    .optional()
    .describe(
      "Mode for parsing entities in the message text. " +
        "Use 'HTML' for HTML tags, 'Markdown' for legacy Markdown, or 'MarkdownV2' for extended Markdown.",
    ),
};

export const registerSendMessageTool = (server: McpServer) => {
  server.registerTool(
    "telegram_send_message",
    {
      description:
        "Send a text message to a Telegram chat. " +
        "Returns the sent message with its message_id which can be used for replies, edits, or reactions. " +
        "Use replyToMessageId to reply to a specific message. " +
        "Use telegram_update_message to edit a sent message.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ chatId, text, textFile, replyToMessageId, parseMode }) => {
          const resolvedText = await resolveContent(text, textFile, "text");

          const telegramService = getTelegramService();
          const result = await telegramService.sendMessage({
            chatId,
            text: resolvedText,
            replyToMessageId,
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
