import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  threadId: z
    .string()
    .describe(
      "The ID of the Quip document (thread) to retrieve. Example: 'AbCdEfGhIjK'",
    ),
};

export const registerGetDocumentTool = (server: McpServer) => {
  server.registerTool(
    "quip_get_document",
    {
      description:
        "Get a Quip document by its thread ID. Returns the path to a temporary JSON file containing document metadata and HTML content. " +
        "Use this when you already know the thread ID; use quip_search_documents to find documents by keywords. " +
        "Read the returned file path to access the JSON payload. The 'html' field contains section IDs (id=\"...\") for use with quip_edit_document or quip_add_comment.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("quip", "get-document", async ({ threadId }) => {
        const quipService = getQuipService();
        const thread = await quipService.getThread({ threadId });
        return JSON.stringify(thread, null, 2);
      }),
    ),
  );
};
