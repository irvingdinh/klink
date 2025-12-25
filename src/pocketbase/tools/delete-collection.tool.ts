import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collectionIdOrName: z
    .string()
    .describe("The ID or name of the collection to delete."),
};

export const registerDeleteCollectionTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_delete_collection",
    {
      description:
        "Delete a collection and all its records. This action is irreversible. Use pocketbase_get_collection first to verify the collection exists. Returns confirmation of deletion.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collectionIdOrName }) => {
        const pocketbaseService = getPocketBaseService();
        await pocketbaseService.deleteCollection({ id: collectionIdOrName });

        return JSON.stringify(
          { ok: true, deleted: collectionIdOrName },
          null,
          2,
        );
      }),
    ),
  );
};
