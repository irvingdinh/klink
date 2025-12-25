import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

export const registerListCollectionsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_list_collections",
    {
      description:
        "List all collections in the Pocketbase database. Returns collection schemas including field definitions, indexes, and API rules. Use this to discover available collections before querying records. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema: {},
    },
    withErrorHandling(
      withTemporaryTextOutput("pocketbase", "list-collections", async () => {
        const pocketbaseService = getPocketBaseService();
        const collections = await pocketbaseService.listCollections();

        return JSON.stringify(collections, null, 2);
      }),
    ),
  );
};
