import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  id: z.string().describe("The Dynatrace SLO ID"),
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
  timeFrame: z
    .string()
    .optional()
    .describe(
      "The timeframe to calculate the SLO values. Example: 'CURRENT', 'GTF' (global time frame using from/to)",
    ),
};

export const registerGetSloTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_get_slo",
    {
      description:
        "Get a single Dynatrace SLO by its ID. Returns full SLO details including current status, burn rate, error budget remaining, target percentage, and evaluation timeframe. Use dynatrace_list_slos first to find SLO IDs. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "get-slo",
        async ({ id, from, to, timeFrame }) => {
          const service = getDynatraceService();
          const result = await service.getSlo({ id, from, to, timeFrame });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
