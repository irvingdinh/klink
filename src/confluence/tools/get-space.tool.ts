import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getConfluenceService } from "../services/external/confluence.service.ts";

const inputSchema = {
  spaceKey: z
    .string()
    .describe(
      "The key of the space to retrieve. Example: 'BNA', 'SBNARCH', 'DEV'",
    ),
  expand: z
    .string()
    .default("description.plain,homepage")
    .describe(
      "Comma-separated list of properties to expand. Defaults to 'description.plain,homepage'.",
    ),
};

export const registerGetSpaceTool = (server: McpServer) => {
  server.registerTool(
    "confluence_get_space",
    {
      description:
        "Get a single Confluence space by its key. Returns space details including name, description, type, and homepage. Use confluence_list_spaces to discover available space keys. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "get-space",
        async ({ spaceKey, expand }) => {
          const service = getConfluenceService();
          const space = await service.getSpace({ spaceKey, expand });

          return JSON.stringify(space, null, 2);
        },
      ),
    ),
  );
};
