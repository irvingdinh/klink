import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  problemSelector: z
    .string()
    .optional()
    .describe(
      "Problem selector to filter results. Example: 'status(\"OPEN\")', 'severityLevel(\"CRITICAL\")', 'managementZoneIds(\"123\")'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of additional fields. Example: '+evidenceDetails,+impactAnalysis,+recentComments'",
    ),
  from: z
    .string()
    .optional()
    .describe(
      "Start of the requested timeframe. Relative ('now-24h') or absolute (epoch ms)",
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
    .describe("Maximum number of problems to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
};

export const registerListProblemsTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_problems",
    {
      description:
        "List Dynatrace detected problems. Returns problem IDs, titles, severity levels, impact, affected/impacted entities, management zones, and entity tags. Use this to see what is currently broken or degraded. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-problems",
        async ({
          problemSelector,
          fields,
          from,
          to,
          pageSize,
          nextPageKey,
        }) => {
          const service = getDynatraceService();
          const result = await service.listProblems({
            problemSelector,
            fields,
            from,
            to,
            pageSize,
            nextPageKey,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
