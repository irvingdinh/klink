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
  name: z.string().describe("The name of the new workflow."),
  nodes: z
    .string()
    .optional()
    .describe(
      "JSON string containing an array of node objects for the workflow. " +
        "Each node must include type, name, position, and parameters. " +
        'Example: \'[{"type":"n8n-nodes-base.start","name":"Start","position":[250,300],"parameters":{}}]\'',
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
      "JSON string containing the connections object that defines how nodes are linked. " +
        'Example: \'{"Start":{"main":[[{"node":"End","type":"main","index":0}]]}}\'',
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
      "JSON string containing workflow settings. " +
        'Example: \'{"saveManualExecutions":true,"callerPolicy":"workflowsFromSameOwner"}\'',
    ),
};

export const registerCreateWorkflowTool = (server: McpServer) => {
  server.registerTool(
    "n8n_create_workflow",
    {
      description:
        "Create a new workflow in n8n. " +
        "Provide the workflow name and optionally its nodes, connections, and settings. " +
        "The workflow is created in inactive state. " +
        "Use n8n_activate_workflow to activate it after creation.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({
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
          const result = await service.createWorkflow({
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
