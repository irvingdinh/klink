import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  id: z
    .string()
    .describe("The ID of the execution to retrieve. Example: '5001'"),
};

export const registerGetExecutionTool = (server: McpServer) => {
  server.registerTool(
    "n8n_get_execution",
    {
      description:
        "Get details of a specific workflow execution by its ID, including status, timing, and node-level results. " +
        "Use this when you already know the execution ID; " +
        "use n8n_list_executions to find executions by workflow or status. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("n8n", "get-execution", async ({ id }) => {
        const service = getN8nService();
        const result = await service.getExecution({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
