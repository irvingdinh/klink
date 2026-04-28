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
      "The product ID or reference prefix. Example: 'GTT' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,id,reference_prefix,created_at'",
    ),
};

export const registerGetProductTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_product",
    {
      description:
        "Get a single Aha! product by its ID or reference prefix (e.g., 'GTT'). Returns product details including name, description, and configuration. Use aha_list_products to discover product IDs first. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "get-product",
        async ({ productId, fields }) => {
          const service = getAhaService();
          const result = await service.getProduct({ productId, fields });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
