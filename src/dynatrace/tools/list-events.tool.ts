import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  eventSelector: z
    .string()
    .optional()
    .describe(
      "Event selector to filter results. Example: 'eventType(\"SERVICE_ERROR_RATE_INCREASED\")', 'entityId(\"SERVICE-123\")'",
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
    .describe("Maximum number of events to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
};

export const registerListEventsTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_events",
    {
      description:
        "List Dynatrace events including anomalies, custom alerts, GC issues, failure rate increases, and more. Returns event IDs, types, titles, affected entities, properties, and status. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-events",
        async ({ eventSelector, from, to, pageSize, nextPageKey }) => {
          const service = getDynatraceService();
          const result = await service.listEvents({
            eventSelector,
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
