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
      "The ID of the Slack channel to send the message to. Example: 'C01ABC123'",
    ),
  text: z
    .string()
    .optional()
    .describe("The message text to send. Supports Slack mrkdwn formatting."),
  textFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the message text. Use this for large messages. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  threadTs: z
    .string()
    .optional()
    .describe(
      "The timestamp of the parent message to reply in thread. " +
        "If provided, the message will be sent as a thread reply. " +
        "Example: '1234567890.123456'",
    ),
};

export const registerSendMessageTool = (server: McpServer) => {
  server.registerTool(
    "slack_send_message",
    {
      description:
        "Send a message to a Slack channel or as a thread reply. " +
        "Returns the message timestamp (ts) which can be used for threading. " +
        "Use threadTs to reply in an existing thread. " +
        "Use slack_update_message to edit a sent message.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ channel, text, textFile, threadTs }) => {
        const resolvedText = await resolveContent(text, textFile, "text");

        const slackService = getSlackService();
        const result = await slackService.postMessage({
          conversationId: channel,
          text: resolvedText,
          threadTs,
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
