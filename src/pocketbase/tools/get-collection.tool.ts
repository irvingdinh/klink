import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collectionIdOrName: z
    .string()
    .describe(
      "The ID or name of the collection. Example: 'users' or 'abc123xyz'",
    ),
};

export const registerGetCollectionTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_collection",
    {
      description:
        "Get a single collection by its ID or name. Returns the full collection schema including field definitions, indexes, and API rules. Use this when you need detailed information about a specific collection's structure. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "pocketbase",
        "get-collection",
        async ({ collectionIdOrName }) => {
          const pocketbaseService = getPocketBaseService();
          const collection = await pocketbaseService.getCollection({
            id: collectionIdOrName,
          });

          return JSON.stringify(collection, null, 2);
        },
      ),
    ),
  );
};
