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
      "The ID of the Slack channel containing the thread. Example: 'C01ABC123'",
    ),
  threadTs: z
    .string()
    .describe(
      "The timestamp of the parent message (thread root). Example: '1234567890.123456'",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(100)
    .describe("Maximum number of replies to return (1-1000). Defaults to 100."),
  cursor: z
    .string()
    .optional()
    .describe(
      "Pagination cursor from a previous response's response_metadata.next_cursor. " +
        "Use this to fetch the next page of results.",
    ),
};

export const registerGetThreadRepliesTool = (server: McpServer) => {
  server.registerTool(
    "slack_get_thread_replies",
    {
      description:
        "Get all replies in a Slack thread by the parent message timestamp. " +
        "Use this to get full thread context when responding to messages in existing threads. " +
        "Returns the parent message and all replies with full metadata. " +
        "Use slack_get_conversation_history to get channel/DM message history instead. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "slack",
        "get-thread-replies",
        async ({ conversationId, threadTs, limit, cursor }) => {
          const slackService = getSlackService();
          const result = await slackService.getConversationReplies({
            conversationId,
            threadTs,
            limit,
            cursor,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
