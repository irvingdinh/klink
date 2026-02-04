import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  id: z.string().describe("The ID of the workflow to delete. Example: '1001'"),
};

export const registerDeleteWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_delete_workflow",
    {
      description:
        "Delete an n8n workflow by its ID. " +
        "This permanently removes the workflow and cannot be undone. " +
        "Use n8n_get_workflow first to verify you are deleting the correct workflow.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ id }) => {
        const service = getN8nService();
        const result = await service.deleteWorkflow({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
