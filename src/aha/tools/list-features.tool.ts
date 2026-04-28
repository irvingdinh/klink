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
    .describe("The product ID or reference prefix. Example: 'GTT'"),
  releaseId: z
    .string()
    .optional()
    .describe(
      "The release ID or reference number to list features within. Example: 'GTT-R-1'",
    ),
  epicId: z
    .string()
    .optional()
    .describe(
      "The epic ID or reference number to list features within. Example: 'GTT-E-1'",
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

export const registerListFeaturesTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_features",
    {
      description:
        "List features in Aha! scoped to a product, release, or epic. Provide exactly one of productId, releaseId, or epicId. Returns feature names, reference numbers (e.g., 'GTT-123'), status, and assignees. Use aha_get_feature for full details on a specific feature. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-features",
        async ({ productId, releaseId, epicId, page, perPage }) => {
          const provided = [productId, releaseId, epicId].filter(Boolean);
          if (provided.length !== 1) {
            throw new Error(
              "Provide exactly one of productId, releaseId, or epicId. Use aha_list_products, aha_list_releases, or aha_list_epics to discover IDs.",
            );
          }

          const service = getAhaService();
          const result = await service.listFeatures({
            productId,
            releaseId,
            epicId,
            page,
            perPage,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
