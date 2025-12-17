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
      "The ID of the Quip document (thread) to append to. Example: 'AbCdEfGhIjK'",
    ),
  content: z
    .string()
    .optional()
    .describe(
      "The content to append in Markdown format. Example: '## New Section\\n\\nNew content here.'",
    ),
  contentFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the content. Use this for large content. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  location: z
    .enum(["beginning", "end"])
    .default("end")
    .describe(
      "Where to insert the content. 'end' (default) appends to the document, 'beginning' prepends.",
    ),
};

export const registerAppendDocumentTool = (server: McpServer) => {
  server.registerTool(
    "quip_append_document",
    {
      description:
        "Append or prepend content to an existing Quip document. " +
        "For section-specific edits, use quip_edit_document instead.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ threadId, content, contentFile, location }) => {
        const resolvedContent = await resolveContent(
          content,
          contentFile,
          "content",
        );

        const quipService = getQuipService();
        const operation = location === "beginning" ? "prepend" : "append";

        await quipService.editDocument({
          threadId,
          content: resolvedContent,
          operation,
          format: "markdown",
        });

        return `Successfully ${operation}ed content to document ${threadId}`;
      }),
    ),
  );
};
