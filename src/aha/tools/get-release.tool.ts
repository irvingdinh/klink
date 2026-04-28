import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  releaseId: z
    .string()
    .describe(
      "The release ID or reference number. Example: 'GTT-R-1' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,start_date,release_date,theme'",
    ),
};

export const registerGetReleaseTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_release",
    {
      description:
        "Get a single Aha! release by its ID or reference number (e.g., 'GTT-R-1'). Returns release details including name, dates, theme, and description (converted to Markdown). Use aha_list_releases to find release reference numbers. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "get-release",
        async ({ releaseId, fields }) => {
          const service = getAhaService();
          const result = await service.getRelease({ releaseId, fields });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
