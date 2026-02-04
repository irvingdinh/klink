import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  workflowId: z
    .string()
    .optional()
    .describe(
      "Filter executions by workflow ID. Omit to return executions across all workflows.",
    ),
  status: z
    .enum(["error", "success", "waiting"])
    .optional()
    .describe(
      "Filter by execution status: 'error', 'success', or 'waiting'. Omit to return all statuses.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(250)
    .default(20)
    .describe(
      "Maximum number of executions to return (1-250). Defaults to 20.",
    ),
  cursor: z
    .string()
    .optional()
    .describe(
      "Pagination cursor from a previous response's nextCursor. Use this to fetch the next page of results.",
    ),
};

export const registerListExecutionsTool = (server: McpServer) => {
  server.registerTool(
    "n8n_list_executions",
    {
      description:
        "List workflow executions in the n8n instance. " +
        "Optionally filter by workflow ID or execution status. " +
        "Use n8n_get_execution to get full details of a specific execution. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "n8n",
        "list-executions",
        async ({ workflowId, status, limit, cursor }) => {
          const service = getN8nService();
          const result = await service.listExecutions({
            workflowId,
            status,
            limit,
            cursor,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
