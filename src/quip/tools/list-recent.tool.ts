import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  count: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Number of recent documents to return (1-50). Defaults to 10."),
  maxUpdatedUsec: z
    .number()
    .int()
    .optional()
    .describe(
      "For pagination: pass the smallest updated_usec from the previous response to get the next page of older results. " +
        "Example: 1765950536091068",
    ),
};

export const registerListRecentTool = (server: McpServer) => {
  server.registerTool(
    "quip_list_recent",
    {
      description:
        "List recently accessed Quip documents. Returns documents ordered by most recently viewed/edited. " +
        "Use this to discover recent work; use quip_search_documents for keyword-based search. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "quip",
        "list-recent",
        async ({ count, maxUpdatedUsec }) => {
          const quipService = getQuipService();
          const threads = await quipService.getRecentThreads({
            count,
            maxUpdatedUsec,
          });
          return JSON.stringify(threads, null, 2);
        },
      ),
    ),
  );
};
