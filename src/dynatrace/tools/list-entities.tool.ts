import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  entitySelector: z
    .string()
    .describe(
      "Entity selector expression. Example: 'type(SERVICE)', 'type(HOST),tag(\"space:live\")', 'type(PROCESS_GROUP_INSTANCE),entityName.contains(\"lbn\")'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of additional fields to include. Prefix with '+' to add. Example: '+properties,+tags,+managementZones'",
    ),
  from: z
    .string()
    .optional()
    .describe(
      "Start of the requested timeframe. Relative ('now-72h') or absolute (epoch ms)",
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
    .describe("Maximum number of entities to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
};

export const registerListEntitiesTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_entities",
    {
      description:
        "List Dynatrace monitored entities matching a selector expression. Returns entity IDs, display names, and optionally properties/tags/management zones. Entity types include SERVICE, HOST, PROCESS_GROUP_INSTANCE, APPLICATION, and more. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-entities",
        async ({ entitySelector, fields, from, to, pageSize, nextPageKey }) => {
          const service = getDynatraceService();
          const result = await service.listEntities({
            entitySelector,
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
