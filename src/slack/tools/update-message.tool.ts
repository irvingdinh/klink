import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
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
    .optional()
    .describe("The new message text. Supports Slack mrkdwn formatting."),
  textFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the new message text. Use this for large messages. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
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
      withTextOutput(async ({ channel, ts, text, textFile }) => {
        const resolvedText = await resolveContent(text, textFile, "text");

        const slackService = getSlackService();
        const result = await slackService.updateMessage({
          conversationId: channel,
          messageTs: ts,
          text: resolvedText,
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
