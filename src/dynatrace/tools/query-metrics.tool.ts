import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  metricSelector: z
    .string()
    .describe(
      "Metric selector expression to query. Example: 'builtin:service.response.time:avg' or 'builtin:service.errors.total.count:splitBy(\"dt.entity.service\")'",
    ),
  resolution: z
    .string()
    .optional()
    .describe(
      "Desired resolution of data points. Format: Ns|m|h|d or 'Inf' for single value. Example: '1h', '5m', 'Inf'",
    ),
  from: z
    .string()
    .optional()
    .describe(
      "Start of the requested timeframe. Relative ('now-2h') or absolute (epoch ms). Defaults to 'now-2h'",
    ),
  to: z
    .string()
    .optional()
    .describe(
      "End of the requested timeframe. Relative ('now') or absolute (epoch ms). Defaults to 'now'",
    ),
  entitySelector: z
    .string()
    .optional()
    .describe(
      "Entity selector to filter metrics by entity. Example: 'type(SERVICE),tag(\"space:live\")'",
    ),
};

export const registerQueryMetricsTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_query_metrics",
    {
      description:
        "Query Dynatrace metric data points using a metric selector expression. Returns time-series data with timestamps and values per entity. Use this to retrieve actual metric values (response times, error rates, throughput, CPU, memory, etc.). Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "query-metrics",
        async ({ metricSelector, resolution, from, to, entitySelector }) => {
          const service = getDynatraceService();
          const result = await service.queryMetrics({
            metricSelector,
            resolution,
            from,
            to,
            entitySelector,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
