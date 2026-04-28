import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  productId: z
    .string()
    .describe(
      "The product ID or reference prefix to list ideas for. Example: 'GTT'",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number (1-indexed pagination)"),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(30)
    .describe("Number of results per page (1-200)"),
};

export const registerListIdeasTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_ideas",
    {
      description:
        "List ideas in an Aha! product. Ideas represent customer feedback and feature suggestions. Returns idea names, reference numbers, status, and vote counts. Use aha_get_idea for full details on a specific idea. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-ideas",
        async ({ productId, page, perPage }) => {
          const service = getAhaService();
          const result = await service.listIdeas({
            productId,
            page,
            perPage,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
