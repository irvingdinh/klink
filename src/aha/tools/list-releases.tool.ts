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
      "The product ID or reference prefix to list releases for. Example: 'GTT'",
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

export const registerListReleasesTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_releases",
    {
      description:
        "List releases for an Aha! product. Releases represent time-based containers for features. Returns release names, dates, reference numbers (e.g., 'GTT-R-1'), and status. Use aha_get_release for full details on a specific release. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-releases",
        async ({ productId, page, perPage }) => {
          const service = getAhaService();
          const result = await service.listReleases({
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
