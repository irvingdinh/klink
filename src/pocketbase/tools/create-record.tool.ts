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
  data: z
    .string()
    .optional()
    .describe(
      'JSON string containing the record data. Example: \'{"title":"Hello","status":"draft"}\'',
    ),
  dataFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a JSON file containing the record data. Use for large records. Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
};

export const registerCreateRecordTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_create_record",
    {
      description:
        "Create a new record in a collection. The data must conform to the collection's schema. Returns the created record's ID and fields. Use pocketbase_get_collection first to understand the required schema.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collection, data, dataFile }) => {
        const resolvedData = await resolveContent(data, dataFile, "data");
        const parsedData = JSON.parse(resolvedData);

        const pocketbaseService = getPocketBaseService();
        const record = await pocketbaseService.createRecord({
          collection,
          data: parsedData,
        });

        return JSON.stringify(record, null, 2);
      }),
    ),
  );
};
