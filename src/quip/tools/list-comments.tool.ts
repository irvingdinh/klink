import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  threadId: z
    .string()
    .describe(
      "The ID of the Quip document (thread) to list comments for. Example: 'AbCdEfGhIjK'",
    ),
  count: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Maximum number of comments to return (1-100). Defaults to 25."),
  maxCreatedUsec: z
    .number()
    .int()
    .optional()
    .describe(
      "For pagination: pass the smallest created_usec from the previous response to get the next page of older comments. " +
        "Example: 1765950541219972",
    ),
};

export const registerListCommentsTool = (server: McpServer) => {
  server.registerTool(
    "quip_list_comments",
    {
      description:
        "List comments (messages) on a Quip document. Returns comments with author, text, and annotation info. " +
        "Comments with an 'annotation' field are inline comments attached to specific sections. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "quip",
        "list-comments",
        async ({ threadId, count, maxCreatedUsec }) => {
          const quipService = getQuipService();
          const messages = await quipService.getMessages({
            threadId,
            count,
            maxCreatedUsec,
          });
          return JSON.stringify(messages, null, 2);
        },
      ),
    ),
  );
};
