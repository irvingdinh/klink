import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collection: z
    .string()
    .describe("The collection name or ID. Example: 'posts'"),
  recordId: z.string().describe("The record ID. Example: 'abc123xyz'"),
  expand: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of relation fields to expand. Example: 'author,comments'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to return. Example: 'id,title,created'",
    ),
};

export const registerGetRecordTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_record",
    {
      description:
        "Get a single record by its ID from a collection. Use this when you already know the specific record ID; use pocketbase_list_records to search for records by criteria. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "pocketbase",
        "get-record",
        async ({ collection, recordId, expand, fields }) => {
          const pocketbaseService = getPocketBaseService();
          const record = await pocketbaseService.getRecord({
            collection,
            id: recordId,
            expand,
            fields,
          });

          return JSON.stringify(record, null, 2);
        },
      ),
    ),
  );
};
