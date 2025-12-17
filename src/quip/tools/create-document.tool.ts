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
  title: z.string().describe("The title of the new document."),
  content: z
    .string()
    .optional()
    .describe(
      "The content of the document in Markdown format. Example: '# Heading\\n\\nParagraph text here.'",
    ),
  contentFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the content. Use this for large content. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  memberIds: z
    .array(z.string())
    .optional()
    .describe(
      "Array of folder IDs or user IDs to share the document with. " +
        "To create in a specific folder, include the folder ID. Example: ['AbPAOAG7pCK']",
    ),
};

export const registerCreateDocumentTool = (server: McpServer) => {
  server.registerTool(
    "quip_create_document",
    {
      description:
        "Create a new Quip document. Returns the new document's thread ID and link. " +
        "Use quip_append_document or quip_edit_document to modify the document after creation.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ title, content, contentFile, memberIds }) => {
        const resolvedContent = await resolveContent(
          content,
          contentFile,
          "content",
        );

        const quipService = getQuipService();
        const thread = await quipService.createDocument({
          title,
          content: resolvedContent,
          memberIds,
          format: "markdown",
        });

        return JSON.stringify(
          {
            threadId: thread.thread.id,
            title: thread.thread.title,
            link: thread.thread.link,
          },
          null,
          2,
        );
      }),
    ),
  );
};
