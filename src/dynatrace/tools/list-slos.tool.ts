import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe("Filter SLOs by name. Example: 'name(\"availability\")'"),
  from: z
    .string()
    .optional()
    .describe(
      "Start of the requested timeframe. Relative ('now-30d') or absolute (epoch ms)",
    ),
  to: z
    .string()
    .optional()
    .describe(
      "End of the requested timeframe. Relative ('now') or absolute (epoch ms)",
    ),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(500)
    .default(50)
    .describe("Maximum number of SLOs to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
  timeFrame: z
    .string()
    .optional()
    .describe(
      "The timeframe to calculate the SLO values. Example: 'CURRENT', 'GTF' (global time frame using from/to)",
    ),
};

export const registerListSlosTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_slos",
    {
      description:
        "List Dynatrace Service Level Objectives (SLOs) with their current status, error budgets, and compliance percentages. Use this to check overall SLO health. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-slos",
        async ({ filter, from, to, pageSize, nextPageKey, timeFrame }) => {
          const service = getDynatraceService();
          const result = await service.listSlos({
            filter,
            from,
            to,
            pageSize,
            nextPageKey,
            timeFrame,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
