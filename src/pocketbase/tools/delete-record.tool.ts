import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collection: z
    .string()
    .describe("The collection name or ID. Example: 'posts'"),
  recordId: z
    .string()
    .describe("The record ID to delete. Example: 'abc123xyz'"),
};

export const registerDeleteRecordTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_delete_record",
    {
      description:
        "Delete a record from a collection. This action is irreversible. Returns confirmation of deletion.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collection, recordId }) => {
        const pocketbaseService = getPocketBaseService();
        await pocketbaseService.deleteRecord({
          collection,
          id: recordId,
        });

        return JSON.stringify(
          { ok: true, deleted: { collection, recordId } },
          null,
          2,
        );
      }),
    ),
  );
};
