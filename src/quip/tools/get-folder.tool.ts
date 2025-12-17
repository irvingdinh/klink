import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  folderId: z
    .string()
    .describe("The ID of the Quip folder to retrieve. Example: 'AbPAOAG7pCK'"),
};

export const registerGetFolderTool = (server: McpServer) => {
  server.registerTool(
    "quip_get_folder",
    {
      description:
        "Get a Quip folder's metadata and list of children (documents and subfolders). " +
        "Returns folder info with an array of child thread_ids and folder_ids. " +
        "Use quip_get_document to fetch individual documents from the folder. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("quip", "get-folder", async ({ folderId }) => {
        const quipService = getQuipService();
        const folder = await quipService.getFolder({ folderId });
        return JSON.stringify(folder, null, 2);
      }),
    ),
  );
};
