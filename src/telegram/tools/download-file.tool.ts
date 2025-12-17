import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getTelegramService } from "../services/external/telegram.service.ts";

const inputSchema = {
  fileId: z
    .string()
    .describe(
      "The file_id of the file to download. " +
        "You can get this from messages containing documents, photos, voice notes, etc. " +
        "Example: 'BQACAgIAAxkBAAIBZ2...'",
    ),
  destinationPath: z
    .string()
    .optional()
    .describe(
      "Optional absolute path where to save the file. " +
        "If not provided, the file will be saved to the system temp directory. " +
        "Example: '/tmp/downloaded_file.pdf'",
    ),
};

export const registerDownloadFileTool = (server: McpServer) => {
  server.registerTool(
    "telegram_download_file",
    {
      description:
        "Download a file from Telegram by its file_id. " +
        "File IDs are included in messages containing media (documents, photos, voice, etc.). " +
        "Files up to 20 MB can be downloaded. " +
        "Returns the local file path where the file was saved.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ fileId, destinationPath }) => {
        const telegramService = getTelegramService();
        const savedPath = await telegramService.downloadFile({
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
