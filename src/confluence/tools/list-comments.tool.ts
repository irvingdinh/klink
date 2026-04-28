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
      "The numeric page ID or full Confluence URL of the page to list comments for. Example: '123456' or 'https://wiki.example.com/pages/123456/Page-Title'",
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
    .describe("Maximum number of comments to return (1-100)"),
  expand: z
    .string()
    .default(
      "body.view,version,extensions.inlineProperties,extensions.resolution",
    )
    .describe(
      "Comma-separated list of properties to expand. Defaults to body, version, inline properties, and resolution status.",
    ),
};

export const registerListCommentsTool = (server: McpServer) => {
  server.registerTool(
    "confluence_list_comments",
    {
      description:
        "List comments on a Confluence page. Returns comment bodies (converted to Markdown), authors, timestamps, inline context, and resolution status. Use this to review discussions on a page separately from its content. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "list-comments",
        async ({ pageIdOrUrl, start, limit, expand }) => {
          const service = getConfluenceService();
          const pageId = service.resolvePageId(pageIdOrUrl);
          const result = await service.listComments({
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
