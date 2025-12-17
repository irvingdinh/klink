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
      "The absolute path to the file to upload. Example: '/tmp/report.pdf'",
    ),
  caption: z
    .string()
    .optional()
    .describe(
      "Optional caption for the document (0-1024 characters after parsing).",
    ),
  replyToMessageId: z
    .number()
    .int()
    .optional()
    .describe(
      "If the message is a reply, the message ID of the original message.",
    ),
};

export const registerSendDocumentTool = (server: McpServer) => {
  server.registerTool(
    "telegram_send_document",
    {
      description:
        "Upload and send a document (file) to a Telegram chat. " +
        "Supports any file type up to 50 MB. " +
        "Returns the sent message with file information. " +
        "Use telegram_send_photo for images if you want them displayed inline.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ chatId, filePath, caption, replyToMessageId }) => {
          const telegramService = getTelegramService();
          const result = await telegramService.sendDocument({
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
              document: result.document,
            },
            null,
            2,
          );
        },
      ),
    ),
  );
};
