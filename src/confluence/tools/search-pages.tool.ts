import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getConfluenceService } from "../services/external/confluence.service.ts";

const inputSchema = {
  cql: z
    .string()
    .describe(
      "CQL (Confluence Query Language) query string. Example: 'space = BNA AND type = page AND text ~ \"eDocument\"'",
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
    .describe("Maximum number of results to return (1-100)"),
  expand: z
    .string()
    .default("space,version")
    .describe(
      "Comma-separated list of properties to expand. Defaults to 'space,version'.",
    ),
};

export const registerSearchPagesTool = (server: McpServer) => {
  server.registerTool(
    "confluence_search_pages",
    {
      description:
        "Search for Confluence pages using CQL (Confluence Query Language). Use this when you need to find pages by criteria; use confluence_get_page if you already know the page ID or URL. Returns matching pages with space, version, and metadata. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "confluence",
        "search-pages",
        async ({ cql, start, limit, expand }) => {
          const service = getConfluenceService();
          const result = await service.searchPages({
            cql,
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
