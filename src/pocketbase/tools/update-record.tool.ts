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
  collection: z
    .string()
    .describe("The collection name or ID. Example: 'posts'"),
  recordId: z
    .string()
    .describe("The record ID to update. Example: 'abc123xyz'"),
  data: z
    .string()
    .optional()
    .describe(
      'JSON string containing the fields to update. Example: \'{"status":"published"}\'',
    ),
  dataFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a JSON file containing the update data. Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
};

export const registerUpdateRecordTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_update_record",
    {
      description:
        "Update an existing record in a collection. Only provided fields will be updated. Returns the updated record. Use pocketbase_get_record first to see current values.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collection, recordId, data, dataFile }) => {
        const resolvedData = await resolveContent(data, dataFile, "data");
        const parsedData = JSON.parse(resolvedData);

        const pocketbaseService = getPocketBaseService();
        const record = await pocketbaseService.updateRecord({
          collection,
          id: recordId,
          data: parsedData,
        });

        return JSON.stringify(record, null, 2);
      }),
    ),
  );
};
