import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  filter: z
    .string()
    .optional()
    .describe(
      "Filter to limit statistics. Example: 'created >= \"2024-01-01\"'",
    ),
};

export const registerGetLogStatsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_log_stats",
    {
      description:
        "Get aggregated log statistics. Returns request counts, error rates, and timing information. Useful for monitoring and performance analysis. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "pocketbase",
        "get-log-stats",
        async ({ filter }) => {
          const pocketbaseService = getPocketBaseService();
          const stats = await pocketbaseService.getLogStats({ filter });

          return JSON.stringify(stats, null, 2);
        },
      ),
    ),
  );
};
