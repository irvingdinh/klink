import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(500)
    .default(50)
    .describe("Maximum number of entity types to return (1-500)"),
  nextPageKey: z
    .string()
    .optional()
    .describe("Cursor for the next page of results from a previous response"),
};

export const registerListEntityTypesTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_list_entity_types",
    {
      description:
        "List all available Dynatrace entity types with their properties, relationships, and dimension keys. Use this to discover what kinds of entities can be monitored (SERVICE, HOST, PROCESS_GROUP_INSTANCE, APPLICATION, etc.) and what properties/relationships are available for each. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "list-entity-types",
        async ({ pageSize, nextPageKey }) => {
          const service = getDynatraceService();
          const result = await service.listEntityTypes({
            pageSize,
            nextPageKey,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
