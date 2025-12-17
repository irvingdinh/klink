import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getJiraService } from "../services/external/jira.service.ts";

const inputSchema = {
  issueIdOrKey: z
    .string()
    .describe(
      "The ID or key of the issue to retrieve. Example: 'PROJ-123' or '10001'",
    ),
  fields: z
    .string()
    .default("*navigable")
    .describe(
      "Comma-separated list of field IDs to return. Defaults to '*navigable'. Use '*all' for all fields.",
    ),
  expand: z
    .string()
    .default("renderedFields,names,changelog")
    .describe(
      "Comma-separated list of entities to expand. Defaults to 'renderedFields,names,changelog'.",
    ),
};

export const registerGetIssueTool = (server: McpServer) => {
  server.registerTool(
    "jira_get_issue",
    {
      description:
        "Get a single JIRA issue by its ID or key (e.g., 'PROJ-123'). Use this when you already know the specific issue key/ID; use jira_search_issues when you need to find issues by criteria. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "jira",
        "get-issue",
        async ({ issueIdOrKey, fields, expand }) => {
          const jiraService = getJiraService();
          const issue = await jiraService.getIssue({
            issueIdOrKey,
            fields,
            expand,
          });

          return JSON.stringify(issue, null, 2);
        },
      ),
    ),
  );
};
