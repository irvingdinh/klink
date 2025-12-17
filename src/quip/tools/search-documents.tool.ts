import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  query: z
    .string()
    .describe(
      "The search query to find documents. Example: 'project roadmap' or 'API documentation'",
    ),
  count: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum number of results to return (1-50). Defaults to 10."),
  onlyMatchTitles: z
    .boolean()
    .default(false)
    .describe(
      "If true, only search document titles. If false (default), search full content.",
    ),
};

export const registerSearchDocumentsTool = (server: McpServer) => {
  server.registerTool(
    "quip_search_documents",
    {
      description:
        "Search for Quip documents by keywords. Returns matching documents with their metadata. " +
        "Use this to find documents when you don't know the thread ID; use quip_get_document when you already have the ID. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "quip",
        "search-documents",
        async ({ query, count, onlyMatchTitles }) => {
          const quipService = getQuipService();
          const threads = await quipService.searchThreads({
            query,
            count,
            onlyMatchTitles,
          });
          return JSON.stringify(threads, null, 2);
        },
      ),
    ),
  );
};
