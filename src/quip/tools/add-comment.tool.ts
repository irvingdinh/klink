import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getQuipService } from "../services/external/quip.service.ts";

const inputSchema = {
  threadId: z
    .string()
    .describe(
      "The ID of the Quip document (thread) to comment on. Example: 'AbCdEfGhIjK'",
    ),
  content: z
    .string()
    .optional()
    .describe(
      "The text content of the comment to add. Supports plain text. Example: 'Great work on this section!'",
    ),
  contentFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the comment text. Use this for large comments. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  sectionId: z
    .string()
    .optional()
    .describe(
      "The section ID to attach the comment to as an inline annotation. " +
        "Find section IDs in the document HTML from quip_get_document. " +
        "Only text paragraphs (<p>), list items (<li>), and spans (<span>) support inline comments. " +
        "Table row/cell IDs do NOT work; use the span ID inside the cell (e.g., 'temp:s:...' on <span>) instead. " +
        "If omitted, creates a general thread comment.",
    ),
  annotationId: z
    .string()
    .optional()
    .describe(
      "The annotation ID to reply to an existing inline comment thread. " +
        "Find annotation IDs from quip_list_comments (look for annotation.id field). " +
        "Example: 'temp:C:UDddc02...'",
    ),
};

export const registerAddCommentTool = (server: McpServer) => {
  server.registerTool(
    "quip_add_comment",
    {
      description:
        "Add a comment to a Quip document. Can create general thread comments, inline annotations on sections, " +
        "or replies to existing annotation threads.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ threadId, content, contentFile, sectionId, annotationId }) => {
          const resolvedContent = await resolveContent(
            content,
            contentFile,
            "content",
          );

          const quipService = getQuipService();

          const message = await quipService.newMessage({
            threadId,
            content: resolvedContent,
            sectionId,
            annotationId,
          });

          const commentType = annotationId
            ? "reply to annotation"
            : sectionId
              ? "inline comment"
              : "thread comment";

          return JSON.stringify(
            {
              success: true,
              type: commentType,
              messageId: message.id,
              threadId,
            },
            null,
            2,
          );
        },
      ),
    ),
  );
};
