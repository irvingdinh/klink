import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  parentType: z
    .enum(["feature", "epic", "idea", "release"])
    .describe("The type of record to list comments for."),
  parentId: z
    .string()
    .describe(
      "The ID or reference number of the parent record. Example: 'GTT-123' for a feature, 'GTT-E-1' for an epic, 'GTT-I-1' for an idea, 'GTT-R-1' for a release",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number (1-indexed pagination)"),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(30)
    .describe("Number of results per page (1-200)"),
};

export const registerListCommentsTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_comments",
    {
      description:
        "List comments on an Aha! record (feature, epic, idea, or release). Specify parentType and parentId to target the correct record. Returns comment bodies, authors, and timestamps. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-comments",
        async ({ parentType, parentId, page, perPage }) => {
          const service = getAhaService();
          const result = await service.listComments({
            parentType,
            parentId,
            page,
            perPage,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
