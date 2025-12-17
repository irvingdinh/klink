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
  filePath: z
    .string()
    .describe(
      "The absolute path to the photo to upload. Supports JPEG, PNG, GIF, and WebP. " +
        "Example: '/tmp/image.jpg'",
    ),
  caption: z
    .string()
    .optional()
    .describe(
      "Optional caption for the photo (0-1024 characters after parsing).",
    ),
  replyToMessageId: z
    .number()
    .int()
    .optional()
    .describe(
      "If the message is a reply, the message ID of the original message.",
    ),
};

export const registerSendPhotoTool = (server: McpServer) => {
  server.registerTool(
    "telegram_send_photo",
    {
      description:
        "Upload and send a photo to a Telegram chat. " +
        "The photo will be displayed inline in the chat. " +
        "Supports JPEG, PNG, GIF (non-animated), and WebP formats up to 10 MB. " +
        "Use telegram_send_document for other file types or if you don't want inline display. " +
        "Returns the sent message with photo details.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ chatId, filePath, caption, replyToMessageId }) => {
          const telegramService = getTelegramService();
          const result = await telegramService.sendPhoto({
            chatId,
            filePath,
            caption,
            replyToMessageId,
          });

          return JSON.stringify(
            {
              ok: true,
              message_id: result.message_id,
              chat_id: result.chat.id,
              photo: result.photo,
            },
            null,
            2,
          );
        },
      ),
    ),
  );
};
