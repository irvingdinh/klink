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
      "The feature ID or reference number. Example: 'GTT-123' or '6789012345'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of fields to include. Example: 'name,workflow_status,description,assigned_to_user'",
    ),
};

export const registerGetFeatureTool = (server: McpServer) => {
  server.registerTool(
    "aha_get_feature",
    {
      description:
        "Get a single Aha! feature by its ID or reference number (e.g., 'GTT-123'). Returns feature details including name, description (converted to Markdown), status, workflow, assignee, and custom fields. Use aha_list_features to find feature reference numbers. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "aha",
        "get-feature",
        async ({ featureId, fields }) => {
          const service = getAhaService();
          const result = await service.getFeature({ featureId, fields });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
