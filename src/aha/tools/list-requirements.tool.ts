import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  featureId: z
    .string()
    .describe(
      "The feature ID or reference number to list requirements for. Example: 'GTT-123'",
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

export const registerListRequirementsTool = (server: McpServer) => {
  server.registerTool(
    "aha_list_requirements",
    {
      description:
        "List requirements (sub-items) of an Aha! feature. Requirements are child work items nested under features. Returns requirement names, reference numbers (e.g., 'GTT-123-1'), status, and assignees. Use aha_get_requirement for full details. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "list-requirements",
        async ({ featureId, page, perPage }) => {
          const service = getAhaService();
          const result = await service.listRequirements({
            featureId,
            page,
            perPage,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
