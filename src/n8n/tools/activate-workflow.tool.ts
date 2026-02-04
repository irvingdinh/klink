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
    .describe("The ID of the workflow to activate. Example: '1001'"),
};

export const registerActivateWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_activate_workflow",
    {
      description:
        "Activate an n8n workflow so it starts running on its configured triggers. " +
        "The workflow must have at least one trigger node configured. " +
        "Use n8n_deactivate_workflow to stop it.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ id }) => {
        const service = getN8nService();
        const result = await service.activateWorkflow({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
