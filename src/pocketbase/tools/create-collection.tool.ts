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
  name: z
    .string()
    .describe("The collection name. Must be unique. Example: 'posts'"),
  type: z
    .enum(["base", "auth", "view"])
    .default("base")
    .describe(
      "Collection type. 'base' for regular data, 'auth' for user authentication, 'view' for read-only views.",
    ),
  schema: z
    .string()
    .optional()
    .describe(
      'JSON string defining the collection fields. Example: \'[{"name":"title","type":"text","required":true}]\'',
    ),
  schemaFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a JSON file containing the full collection schema. Use for complex collections. Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  listRule: z
    .string()
    .optional()
    .describe(
      "API rule for listing records. Example: '@request.auth.id != \"\"'. Use null string for no access, empty string for public access.",
    ),
  viewRule: z.string().optional().describe("API rule for viewing records."),
  createRule: z.string().optional().describe("API rule for creating records."),
  updateRule: z.string().optional().describe("API rule for updating records."),
  deleteRule: z.string().optional().describe("API rule for deleting records."),
};

export const registerCreateCollectionTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_create_collection",
    {
      description:
        "Create a new collection with the specified schema. Returns the created collection's ID and name. Use pocketbase_list_collections to see existing collections first.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({
          name,
          type,
          schema,
          schemaFile,
          listRule,
          viewRule,
          createRule,
          updateRule,
          deleteRule,
        }) => {
          let collectionData: Record<string, unknown> = { name, type };

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
              collectionData = { ...collectionData, ...parsedSchema };
            }
          }

          if (listRule !== undefined) collectionData.listRule = listRule;
          if (viewRule !== undefined) collectionData.viewRule = viewRule;
          if (createRule !== undefined) collectionData.createRule = createRule;
          if (updateRule !== undefined) collectionData.updateRule = updateRule;
          if (deleteRule !== undefined) collectionData.deleteRule = deleteRule;

          const pocketbaseService = getPocketBaseService();
          const collection = await pocketbaseService.createCollection({
            data: collectionData,
          });

          return JSON.stringify(collection, null, 2);
        },
      ),
    ),
  );
};
