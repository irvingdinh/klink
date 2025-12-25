import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collection: z
    .string()
    .describe("The collection name or ID containing the record."),
  recordId: z.string().describe("The record ID that owns the file."),
  filename: z
    .string()
    .describe(
      "The filename as stored in the record. Example: 'image_abc123.jpg'",
    ),
  thumb: z
    .string()
    .optional()
    .describe(
      "Thumbnail size for images. Example: '100x100', '0x300' (height only), '300x0' (width only).",
    ),
  token: z
    .string()
    .optional()
    .describe(
      "File access token for protected files. Get this from pocketbase_generate_file_token.",
    ),
};

export const registerGetFileUrlTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_file_url",
    {
      description:
        "Generate a URL for accessing a file stored in a record. The URL can be used to download or display the file. For protected files, use pocketbase_generate_file_token first.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ collection, recordId, filename, thumb, token }) => {
          const pocketbaseService = getPocketBaseService();
          const url = pocketbaseService.getFileUrl({
            collection,
            recordId,
            filename,
            thumb,
            token,
          });

          return JSON.stringify({ url }, null, 2);
        },
      ),
    ),
  );
};
