import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  id: z
    .string()
    .describe("The ID of the workflow to deactivate. Example: '1001'"),
};

export const registerDeactivateWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_deactivate_workflow",
    {
      description:
        "Deactivate an n8n workflow so it stops running on its triggers. " +
        "The workflow remains in n8n and can be reactivated with n8n_activate_workflow. " +
        "Manual executions are still possible on deactivated workflows.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ id }) => {
        const service = getN8nService();
        const result = await service.deactivateWorkflow({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
