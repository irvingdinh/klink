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
      "The ID of the Slack channel to upload the file to. Example: 'C01ABC123'",
    ),
  filePath: z
    .string()
    .describe(
      "The absolute path to the file to upload. Example: '/tmp/report.txt'",
    ),
  threadTs: z
    .string()
    .optional()
    .describe(
      "The timestamp of the parent message to attach the file to a thread. " +
        "Example: '1234567890.123456'",
    ),
  filename: z
    .string()
    .optional()
    .describe(
      "Optional custom filename for the uploaded file. " +
        "If not provided, uses the original filename.",
    ),
};

export const registerUploadFileTool = (server: McpServer) => {
  server.registerTool(
    "slack_upload_file",
    {
      description:
        "Upload a local file to a Slack channel or thread. " +
        "Reads the file from the specified absolute path on the local filesystem. " +
        "Returns the file ID and permalink.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ channel, filePath, threadTs, filename }) => {
        const slackService = getSlackService();
        const result = await slackService.uploadFile({
          conversationId: channel,
          file: filePath,
          threadTs,
          fileName: filename,
        });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
