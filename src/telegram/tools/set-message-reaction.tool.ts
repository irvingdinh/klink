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
    .describe("The message ID of the message to react to. Example: 123"),
  emoji: z
    .string()
    .optional()
    .describe(
      "The emoji to use as a reaction. " +
        "Common options: '👍', '👎', '❤️', '🔥', '🎉', '😢', '😮', '😡'. " +
        "If not provided, removes the bot's reaction from the message.",
    ),
};

export const registerSetMessageReactionTool = (server: McpServer) => {
  server.registerTool(
    "telegram_set_message_reaction",
    {
      description:
        "Set an emoji reaction on a message in a Telegram chat. " +
        "The bot can add one reaction per message. " +
        "To remove a reaction, call without providing an emoji. " +
        "Only available emojis from Telegram's reaction list can be used. " +
        "Returns the reaction status.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ chatId, messageId, emoji }) => {
        const telegramService = getTelegramService();
        const result = await telegramService.setMessageReaction({
          chatId,
          messageId,
          emoji,
        });

        return JSON.stringify(
          {
            ok: true,
            reaction_set: result,
            emoji: emoji ?? null,
          },
          null,
          2,
        );
      }),
    ),
  );
};
