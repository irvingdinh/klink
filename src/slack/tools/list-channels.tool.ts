import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getSlackService } from "../services/external/slack.service.ts";

const inputSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(100)
    .describe(
      "Maximum number of channels to return (1-1000). Defaults to 100.",
    ),
  cursor: z
    .string()
    .optional()
    .describe(
      "Pagination cursor from a previous response's response_metadata.next_cursor. " +
        "Use this to fetch the next page of results.",
    ),
};

export const registerListChannelsTool = (server: McpServer) => {
  server.registerTool(
    "slack_list_channels",
    {
      description:
        "List Slack channels the bot has access to. " +
        "Returns both public and private channels. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "slack",
        "list-channels",
        async ({ limit, cursor }) => {
          const slackService = getSlackService();
          const result = await slackService.listChannels({ limit, cursor });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
