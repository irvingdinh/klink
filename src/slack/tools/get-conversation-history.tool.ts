import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getSlackService } from "../services/external/slack.service.ts";

const inputSchema = {
  conversationId: z
    .string()
    .describe(
      "The ID of the Slack conversation to fetch history from. " +
        "Supports channels (C...), DMs (D...), and group DMs (G...). " +
        "Example: 'C01ABC123'",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(25)
    .describe("Maximum number of messages to return (1-1000). Defaults to 25."),
  cursor: z
    .string()
    .optional()
    .describe(
      "Pagination cursor from a previous response's response_metadata.next_cursor. " +
        "Use this to fetch the next page of results.",
    ),
};

export const registerGetConversationHistoryTool = (server: McpServer) => {
  server.registerTool(
    "slack_get_conversation_history",
    {
      description:
        "Get message history from a Slack conversation by conversation ID. " +
        "Supports channels, DMs, and group DMs. " +
        "Returns messages with full metadata including reactions, thread info, and file attachments. " +
        "Use slack_get_thread_replies to get replies within a specific message thread. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "slack",
        "get-conversation-history",
        async ({ conversationId, limit, cursor }) => {
          const slackService = getSlackService();
          const history = await slackService.getConversationHistory({
            conversationId,
            limit,
            cursor,
          });

          return JSON.stringify(history, null, 2);
        },
      ),
    ),
  );
};
