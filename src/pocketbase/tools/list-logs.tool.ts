import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe(
      "Filter query using Pocketbase syntax. Example: 'level >= 400' for errors only.",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination."),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(500)
    .default(30)
    .describe("Number of logs per page."),
};

export const registerListLogsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_list_logs",
    {
      description:
        "List request logs with optional filtering and pagination. Use this to monitor API activity and debug issues. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "pocketbase",
        "list-logs",
        async ({ filter, page, perPage }) => {
          const pocketbaseService = getPocketBaseService();
          const logs = await pocketbaseService.listLogs({
            filter,
            page,
            perPage,
          });

          return JSON.stringify(logs, null, 2);
        },
      ),
    ),
  );
};
