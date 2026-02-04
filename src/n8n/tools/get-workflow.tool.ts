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
    .describe("The ID of the workflow to retrieve. Example: '1001'"),
};

export const registerGetWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_get_workflow",
    {
      description:
        "Get a single n8n workflow by its ID, including its nodes, connections, and settings. " +
        "Use this when you already know the workflow ID; " +
        "use n8n_list_workflows to find workflows by name or status. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("n8n", "get-workflow", async ({ id }) => {
        const service = getN8nService();
        const result = await service.getWorkflow({ id });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
