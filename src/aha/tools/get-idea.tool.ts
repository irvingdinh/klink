import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  ideaId: z
    .string()
    .describe(
      "The idea ID or reference number. Example: 'GTT-I-1' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,workflow_status,description,vote_count'",
    ),
};

export const registerGetIdeaTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_idea",
    {
      description:
        "Get a single Aha! idea by its ID or reference number (e.g., 'GTT-I-1'). Returns idea details including name, description (converted to Markdown), status, votes, and linked features. Use aha_list_ideas to find idea reference numbers. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("aha", "get-idea", async ({ ideaId, fields }) => {
        const service = getAhaService();
        const result = await service.getIdea({ ideaId, fields });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
