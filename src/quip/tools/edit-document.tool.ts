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
      "The ID of the Quip document (thread) to edit. Example: 'AbCdEfGhIjK'",
    ),
  sectionId: z
    .string()
    .describe(
      "The ID of the section to edit. Find section IDs in the document HTML from quip_get_document. " +
        "Look for id=\"...\" attributes on HTML elements. Example: 'temp:C:AbC123'",
    ),
  operation: z
    .enum(["replace", "delete", "after", "before"])
    .describe(
      "'replace' - Replace the section's content. " +
        "'delete' - Remove the section entirely (content param ignored). " +
        "'after' - Insert content after the section. " +
        "'before' - Insert content before the section.",
    ),
  content: z
    .string()
    .optional()
    .describe(
      "The new content in Markdown format. Required for replace/after/before operations. " +
        "Ignored for delete operation.",
    ),
  contentFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the content. Use this for large content. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
};

export const registerEditDocumentTool = (server: McpServer) => {
  server.registerTool(
    "quip_edit_document",
    {
      description:
        "Edit a specific section of a Quip document. " +
        "Use quip_append_document for simple appending to end/beginning of document.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ threadId, sectionId, operation, content, contentFile }) => {
          // For delete operation, content is not required
          const resolvedContent =
            operation === "delete"
              ? ""
              : await resolveContent(content, contentFile, "content");

          const quipService = getQuipService();

          const operationMap: Record<
            string,
            "replace" | "delete" | "after_section" | "before_section"
          > = {
            replace: "replace",
            delete: "delete",
            after: "after_section",
            before: "before_section",
          };

          await quipService.editDocument({
            threadId,
            content: resolvedContent,
            sectionId,
            operation: operationMap[operation],
            format: "markdown",
          });

          const actionText = {
            replace: "Replaced",
            delete: "Deleted",
            after: "Inserted content after",
            before: "Inserted content before",
          }[operation];

          return `${actionText} section ${sectionId} in document ${threadId}`;
        },
      ),
    ),
  );
};
