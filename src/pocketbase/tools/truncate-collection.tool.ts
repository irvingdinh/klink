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
    .describe("The ID or name of the collection to truncate."),
};

export const registerTruncateCollectionTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_truncate_collection",
    {
      description:
        "Delete all records from a collection without deleting the collection itself. This action is irreversible. Use this to clear data while preserving the schema. Returns confirmation of truncation.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collectionIdOrName }) => {
        const pocketbaseService = getPocketBaseService();
        await pocketbaseService.truncateCollection({ id: collectionIdOrName });

        return JSON.stringify(
          { ok: true, truncated: collectionIdOrName },
          null,
          2,
        );
      }),
    ),
  );
};
