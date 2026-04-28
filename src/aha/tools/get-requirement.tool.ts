import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getAhaService } from "../services/external/aha.service.ts";

const inputSchema = {
  requirementId: z
    .string()
    .describe(
      "The requirement ID or reference number. Example: 'GTT-123-1' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,workflow_status,description,assigned_to_user'",
    ),
};

export const registerGetRequirementTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_requirement",
    {
      description:
        "Get a single Aha! requirement by its ID or reference number (e.g., 'GTT-123-1'). Returns requirement details including name, description (converted to Markdown), status, and assignee. Use aha_list_requirements to find requirement reference numbers. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "get-requirement",
        async ({ requirementId, fields }) => {
          const service = getAhaService();
          const result = await service.getRequirement({
            requirementId,
            fields,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
