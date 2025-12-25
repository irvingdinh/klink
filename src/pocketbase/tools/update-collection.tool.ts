import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collectionIdOrName: z
    .string()
    .describe("The ID or name of the collection to update."),
  name: z.string().optional().describe("New collection name."),
  schema: z.string().optional().describe("Updated schema as JSON string."),
  schemaFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a JSON file containing the updated schema. Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  listRule: z.string().optional().describe("Updated API rule for listing."),
  viewRule: z.string().optional().describe("Updated API rule for viewing."),
  createRule: z.string().optional().describe("Updated API rule for creating."),
  updateRule: z.string().optional().describe("Updated API rule for updating."),
  deleteRule: z.string().optional().describe("Updated API rule for deleting."),
};

export const registerUpdateCollectionTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_update_collection",
    {
      description:
        "Update an existing collection's schema, rules, or options. Only provided fields will be updated. Returns the updated collection information. Warning: Modifying field types may cause data loss.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({
          collectionIdOrName,
          name,
          schema,
          schemaFile,
          listRule,
          viewRule,
          createRule,
          updateRule,
          deleteRule,
        }) => {
          const collectionData: Record<string, unknown> = {};

          if (name !== undefined) collectionData.name = name;

          if (schema || schemaFile) {
            const resolvedSchema = await resolveContent(
              schema,
              schemaFile,
              "schema",
            );
            const parsedSchema = JSON.parse(resolvedSchema);

            if (Array.isArray(parsedSchema)) {
              collectionData.fields = parsedSchema;
            } else {
              Object.assign(collectionData, parsedSchema);
            }
          }

          if (listRule !== undefined) collectionData.listRule = listRule;
          if (viewRule !== undefined) collectionData.viewRule = viewRule;
          if (createRule !== undefined) collectionData.createRule = createRule;
          if (updateRule !== undefined) collectionData.updateRule = updateRule;
          if (deleteRule !== undefined) collectionData.deleteRule = deleteRule;

          const pocketbaseService = getPocketBaseService();
          const collection = await pocketbaseService.updateCollection({
            id: collectionIdOrName,
            data: collectionData,
          });

          return JSON.stringify(collection, null, 2);
        },
      ),
    ),
  );
};
