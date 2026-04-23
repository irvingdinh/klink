import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  entityId: z
    .string()
    .describe(
      "The Dynatrace entity ID. Example: 'SERVICE-9E783E84FC8AD291', 'HOST-1234567890ABCDEF'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of additional fields to include. Prefix with '+' to add. Example: '+properties,+tags,+managementZones,+fromRelationships,+toRelationships'",
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
};

export const registerGetEntityTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_get_entity",
    {
      description:
        "Get a single Dynatrace monitored entity by its ID. Returns full entity details including display name, properties (service type, software technologies, etc.), tags, management zones, and relationships. Use dynatrace_list_entities first to find entity IDs. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "get-entity",
        async ({ entityId, fields, from, to }) => {
          const service = getDynatraceService();
          const result = await service.getEntity({
            entityId,
            fields,
            from,
            to,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
