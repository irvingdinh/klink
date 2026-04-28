import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
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

export const registerListProductsTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_products",
    {
      description:
        "List all products (workspaces) in Aha!. Use this to discover product IDs and reference prefixes before listing releases, epics, features, or ideas within a product. Returns product names, reference prefixes, and IDs. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-products",
        async ({ page, perPage }) => {
          const service = getAhaService();
          const result = await service.listProducts({ page, perPage });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
