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
  filter: z
    .string()
    .optional()
    .describe(
      'Filter query using Pocketbase syntax. Example: \'status = "active" && created >= "2024-01-01"\'',
    ),
  sort: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to sort by. Prefix with '-' for descending. Example: '-created,title'",
    ),
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
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination (1-based)."),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(500)
    .default(30)
    .describe("Number of records per page (1-500)."),
};

export const registerListRecordsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_list_records",
    {
      description:
        "List or search records in a collection with filtering, sorting, and pagination. Supports Pocketbase filter syntax for complex queries. Use this to find records matching criteria; use pocketbase_get_record if you already know the record ID. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "pocketbase",
        "list-records",
        async ({ collection, filter, sort, expand, fields, page, perPage }) => {
          const pocketbaseService = getPocketBaseService();
          const records = await pocketbaseService.listRecords({
            collection,
            filter,
            sort,
            expand,
            fields,
            page,
            perPage,
          });

          return JSON.stringify(records, null, 2);
        },
      ),
    ),
  );
};
