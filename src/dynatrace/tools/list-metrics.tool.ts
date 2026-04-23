import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  text: z
    .string()
    .optional()
    .describe(
      "Free-text filter to search metrics by name or description. Example: 'response time', 'cpu', 'error rate'",
    ),
  metricSelector: z
    .string()
    .optional()
    .describe(
      "Metric selector to filter the list. Example: 'builtin:service.*'",
    ),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(500)
    .default(50)
    .describe("Maximum number of metrics to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
};

export const registerListMetricsTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_metrics",
    {
      description:
        "List available Dynatrace metric descriptors. Returns metric IDs, display names, units, and descriptions. Use this to discover what metrics are available before querying them with dynatrace_query_metrics. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-metrics",
        async ({ text, metricSelector, pageSize, nextPageKey }) => {
          const service = getDynatraceService();
          const result = await service.listMetrics({
            text,
            metricSelector,
            pageSize,
            nextPageKey,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
