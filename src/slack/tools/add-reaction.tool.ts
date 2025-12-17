import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getSlackService } from "../services/external/slack.service.ts";

const inputSchema = {
  channel: z
    .string()
    .describe(
      "The ID of the Slack channel containing the message. Example: 'C01ABC123'",
    ),
  timestamp: z
    .string()
    .describe(
      "The timestamp of the message to react to. Example: '1234567890.123456'",
    ),
  emoji: z
    .string()
    .describe(
      "The emoji name to add (without colons). " +
        "Example: 'thumbsup', 'eyes', 'rocket', 'white_check_mark'",
    ),
};

export const registerAddReactionTool = (server: McpServer) => {
  server.registerTool(
    "slack_add_reaction",
    {
      description:
        "Add an emoji reaction to a Slack message. Returns success or failure status.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ channel, timestamp, emoji }) => {
        const slackService = getSlackService();
        const result = await slackService.addReaction({
          conversationId: channel,
          messageTs: timestamp,
          emoji,
        });

        return JSON.stringify({ ok: result.ok }, null, 2);
      }),
    ),
  );
};
