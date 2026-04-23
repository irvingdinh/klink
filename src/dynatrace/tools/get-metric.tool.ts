import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  metricId: z
    .string()
    .describe(
      "The fully qualified metric ID. Example: 'builtin:service.response.time'",
    ),
};

export const registerGetMetricTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_get_metric",
    {
      description:
        "Get the descriptor of a single Dynatrace metric by its ID. Returns detailed metadata including aggregation types, dimension keys, transformations, unit, and default aggregation. Use this to understand a metric's structure before crafting a query with dynatrace_query_metrics. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "get-metric",
        async ({ metricId }) => {
          const service = getDynatraceService();
          const result = await service.getMetric({ metricId });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
