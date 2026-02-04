import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  id: z.string().describe("The ID of the execution to delete. Example: '5001'"),
};

export const registerDeleteExecutionTool = (server: McpServer) => {
  server.registerTool(
    "n8n_delete_execution",
    {
      description:
        "Delete a specific workflow execution by its ID. " +
        "This permanently removes the execution record and cannot be undone.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ id }) => {
        const service = getN8nService();
        const result = await service.deleteExecution({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
