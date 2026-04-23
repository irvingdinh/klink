import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getDynatraceService } from "../services/external/dynatrace.service.ts";

const inputSchema = {
  problemId: z
    .string()
    .describe(
      "The Dynatrace problem ID. Example: '1206923791150561515_1776930060000V2'",
    ),
  fields: z
    .string()
    .optional()
    .describe(
      "Comma-separated list of additional fields. Example: '+evidenceDetails,+impactAnalysis,+recentComments'",
    ),
};

export const registerGetProblemTool = (server: McpServer) => {
  server.registerTool(
    "dynatrace_get_problem",
    {
      description:
        "Get a single Dynatrace problem by its ID. Returns full problem details including evidence, impact analysis, recent comments, root cause entity, and affected services. Use dynatrace_list_problems first to find problem IDs. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "dynatrace",
        "get-problem",
        async ({ problemId, fields }) => {
          const service = getDynatraceService();
          const result = await service.getProblem({ problemId, fields });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
