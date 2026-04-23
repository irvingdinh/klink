import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  eventId: z
    .string()
    .describe(
      "The Dynatrace event ID. Example: '-8967503614286276448_1776930600000'",
    ),
};

export const registerGetEventTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_get_event",
    {
      description:
        "Get a single Dynatrace event by its ID. Returns full event details including type, title, affected entity, properties (thresholds, metric selectors, descriptions), entity tags, and maintenance status. Use dynatrace_list_events first to find event IDs. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("dynatrace", "get-event", async ({ eventId }) => {
        const service = getDynatraceService();
        const result = await service.getEvent({ eventId });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
