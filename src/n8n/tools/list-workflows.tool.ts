import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  active: z
    .boolean()
    .optional()
    .describe(
      "Filter by active status. Set to true for active workflows only, false for inactive only. Omit to return all.",
    ),
  tags: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of tag names to filter workflows by. Only workflows with all specified tags are returned.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(250)
    .default(100)
    .describe(
      "Maximum number of workflows to return (1-250). Defaults to 100.",
    ),
  cursor: z
    .string()
    .optional()
    .describe(
      "Pagination cursor from a previous response's nextCursor. Use this to fetch the next page of results.",
    ),
};

export const registerListWorkflowsTool = (server: McpServer) => {
  server.registerTool(
    "n8n_list_workflows",
    {
      description:
        "List workflows in the n8n instance. " +
        "Optionally filter by active status or tags. " +
        "Use n8n_get_workflow to get full details of a specific workflow. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "n8n",
        "list-workflows",
        async ({ active, tags, limit, cursor }) => {
          const service = getN8nService();
          const result = await service.listWorkflows({
            active,
            tags,
            limit,
            cursor,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
