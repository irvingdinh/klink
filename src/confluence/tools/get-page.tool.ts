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
      "The numeric page ID or full Confluence URL. Example: '123456' or 'https://wiki.example.com/pages/123456/Page-Title'",
    ),
  expand: z
    .string()
    .default(
      "space,version,body.view,body.storage,metadata.labels,ancestors,children.attachment",
    )
    .describe(
      "Comma-separated list of properties to expand. Defaults to space, version, body, labels, ancestors, and attachments.",
    ),
};

export const registerGetPageTool = (server: McpServer) => {
  server.registerTool(
    "confluence_get_page",
    {
      description:
        "Get a single Confluence page by its ID or URL. Returns page title, body content (converted to Markdown), metadata, labels, ancestors, and attachment list. Use this when you already know the page ID or have a URL; use confluence_search_pages to find pages by criteria. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "get-page",
        async ({ pageIdOrUrl, expand }) => {
          const service = getConfluenceService();
          const pageId = service.resolvePageId(pageIdOrUrl);
          const page = await service.getPage({ pageId, expand });

          return JSON.stringify(page, null, 2);
        },
      ),
    ),
  );
};
