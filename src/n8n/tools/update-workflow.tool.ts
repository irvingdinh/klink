import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

const inputSchema = {
  id: z.string().describe("The ID of the workflow to update. Example: '1001'"),
  name: z
    .string()
    .optional()
    .describe("New name for the workflow. Omit to keep the current name."),
  nodes: z
    .string()
    .optional()
    .describe(
      "JSON string containing the full array of node objects. " +
        "This replaces all existing nodes. Use n8n_get_workflow first to see current nodes.",
    ),
  nodesFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the nodes JSON array. ` +
        `Use this for large node definitions. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  connections: z
    .string()
    .optional()
    .describe(
      "JSON string containing the connections object. " +
        "This replaces all existing connections.",
    ),
  connectionsFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the connections JSON object. ` +
        `Use this for large connection definitions. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  settings: z
    .string()
    .optional()
    .describe(
      "JSON string containing workflow settings to update. " +
        "Example: '{\"saveManualExecutions\":true}'",
    ),
};

export const registerUpdateWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_update_workflow",
    {
      description:
        "Update an existing n8n workflow. " +
        "Provide the workflow ID and the fields to update. " +
        "Only provided fields are changed; omitted fields retain their current values. " +
        "If the workflow is active, the updated version is automatically reactivated.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({
          id,
          name,
          nodes,
          nodesFile,
          connections,
          connectionsFile,
          settings,
        }) => {
          const resolvedNodes =
            nodes || nodesFile
              ? JSON.parse(await resolveContent(nodes, nodesFile, "nodes"))
              : undefined;

          const resolvedConnections =
            connections || connectionsFile
              ? JSON.parse(
                  await resolveContent(
                    connections,
                    connectionsFile,
                    "connections",
                  ),
                )
              : undefined;

          const parsedSettings = settings ? JSON.parse(settings) : undefined;

          const service = getN8nService();
          const result = await service.updateWorkflow({
            id,
            name,
            nodes: resolvedNodes,
            connections: resolvedConnections,
            settings: parsedSettings,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
