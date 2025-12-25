import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  logId: z.string().describe("The log entry ID."),
};

export const registerGetLogTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_log",
    {
      description:
        "Get a single log entry by its ID. Returns full log details including request/response data. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("pocketbase", "get-log", async ({ logId }) => {
        const pocketbaseService = getPocketBaseService();
        const log = await pocketbaseService.getLog({ id: logId });

        return JSON.stringify(log, null, 2);
      }),
    ),
  );
};
