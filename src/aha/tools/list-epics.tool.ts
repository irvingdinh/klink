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
    .optional()
    .describe(
      "The product ID or reference prefix. Provide this OR releaseId. Example: 'GTT'",
    ),
  releaseId: z
    .string()
    .optional()
    .describe(
      "The release ID or reference number. Provide this OR productId to list epics scoped to a release. Example: 'GTT-R-1'",
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

export const registerListEpicsTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_epics",
    {
      description:
        "List epics in an Aha! product or release. Provide either productId (all epics in the product) or releaseId (epics scoped to a release). Returns epic names, reference numbers (e.g., 'GTT-E-1'), and status. Use aha_get_epic for full details. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-epics",
        async ({ productId, releaseId, page, perPage }) => {
          if (!productId && !releaseId) {
            throw new Error(
              "Provide either productId or releaseId. Use aha_list_products to find product IDs or aha_list_releases to find release IDs.",
            );
          }

          const service = getAhaService();
          const result = await service.listEpics({
            productId,
            releaseId,
            page,
            perPage,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
