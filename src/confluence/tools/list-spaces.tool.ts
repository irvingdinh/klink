import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getConfluenceService } from "../services/external/confluence.service.ts";

const inputSchema = {
  start: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Index of the first result to return (0-based pagination)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Maximum number of spaces to return (1-100)"),
  type: z
    .string()
    .optional()
    .describe(
      "Filter by space type. Example: 'global' for site spaces, 'personal' for user spaces.",
    ),
};

export const registerListSpacesTool = (server: McpServer) => {
  server.registerTool(
    "confluence_list_spaces",
    {
      description:
        "List available Confluence spaces. Use this to discover what spaces exist before searching for pages. Returns space keys, names, and types. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "list-spaces",
        async ({ start, limit, type }) => {
          const service = getConfluenceService();
          const result = await service.listSpaces({ start, limit, type });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
