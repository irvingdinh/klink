import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getSlackService } from "../services/external/slack.service.ts";

const inputSchema = {
  fileId: z
    .string()
    .describe(
      "The ID of the Slack file to download. " +
        "You can get this from message attachments in conversation history. " +
        "Example: 'F01ABC123DE'",
    ),
  destinationPath: z
    .string()
    .optional()
    .describe(
      "Optional absolute path where to save the file. " +
        "If not provided, the file will be saved to the system temp directory with its original name. " +
        "Example: '/tmp/downloaded_file.pdf'",
    ),
};

export const registerDownloadFileTool = (server: McpServer) => {
  server.registerTool(
    "slack_download_file",
    {
      description:
        "Download a file from Slack by its file ID. " +
        "File IDs are included in messages containing attachments (found in the 'files' array of message objects). " +
        "Use slack_get_conversation_history first to find file IDs. " +
        "Returns JSON with 'file_path' indicating where the file was saved.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ fileId, destinationPath }) => {
        const slackService = getSlackService();
        const savedPath = await slackService.downloadFile({
          fileId,
          destinationPath,
        });

        return JSON.stringify(
          {
            ok: true,
            file_path: savedPath,
          },
          null,
          2,
        );
      }),
    ),
  );
};
