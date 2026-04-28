import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getConfluenceService } from "../services/external/confluence.service.ts";

const inputSchema = {
  pageIdOrUrl: z
    .string()
    .describe(
      "The numeric page ID or full Confluence URL of the parent page. Example: '123456' or 'https://wiki.example.com/pages/123456/Parent-Page'",
    ),
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
    .describe("Maximum number of child pages to return (1-100)"),
  expand: z
    .string()
    .default("version")
    .describe(
      "Comma-separated list of properties to expand. Defaults to 'version'.",
    ),
};

export const registerListChildPagesTool = (server: McpServer) => {
  server.registerTool(
    "confluence_list_child_pages",
    {
      description:
        "List direct child pages under a parent Confluence page. Use this to navigate page hierarchies and discover sub-pages. Returns child page IDs, titles, and version info. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "list-child-pages",
        async ({ pageIdOrUrl, start, limit, expand }) => {
          const service = getConfluenceService();
          const pageId = service.resolvePageId(pageIdOrUrl);
          const result = await service.listChildPages({
            pageId,
            start,
            limit,
            expand,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
