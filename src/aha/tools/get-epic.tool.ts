import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  epicId: z
    .string()
    .describe(
      "The epic ID or reference number. Example: 'GTT-E-1' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,workflow_status,description'",
    ),
};

export const registerGetEpicTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_epic",
    {
      description:
        "Get a single Aha! epic by its ID or reference number (e.g., 'GTT-E-1'). Returns epic details including name, description (converted to Markdown), status, and associated features. Use aha_list_epics to find epic reference numbers. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("aha", "get-epic", async ({ epicId, fields }) => {
        const service = getAhaService();
        const result = await service.getEpic({ epicId, fields });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
