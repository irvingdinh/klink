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
  ts: z
    .string()
    .describe(
      "The timestamp of the message to update. Example: '1234567890.123456'",
    ),
  text: z
    .string()
    .describe("The new message text. Supports Slack mrkdwn formatting."),
};

export const registerUpdateMessageTool = (server: McpServer) => {
  server.registerTool(
    "slack_update_message",
    {
      description:
        "Update an existing Slack message (edit-in-place). " +
        "Use this for status updates during long-running tasks. " +
        "Requires the message timestamp (ts) from the original message.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ channel, ts, text }) => {
        const slackService = getSlackService();
        const result = await slackService.updateMessage({
          conversationId: channel,
          messageTs: ts,
          text,
        });

        return JSON.stringify(
          {
            ok: result.ok,
            ts: result.ts,
            channel: result.channel,
          },
          null,
          2,
        );
      }),
    ),
  );
};
