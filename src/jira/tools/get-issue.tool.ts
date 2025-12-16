import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { FileService } from "../../core/service/file.service.ts";
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
    async ({ issueIdOrKey, fields, expand }) => {
      try {
        const jiraService = getJiraService();

        const issue = await jiraService.getIssue({
          issueIdOrKey,
          fields,
          expand,
        });

        const outputFilePath = await FileService.writeTemporaryTextOutput(
          "jira",
          "get-issue",
          JSON.stringify(issue, null, 2),
        );

        return {
          content: [
            {
              type: "text",
              text: outputFilePath,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        return {
          content: [
            {
              type: "text",
              text:
                `Error getting issue '${issueIdOrKey}': ${message}\n\n` +
                "Troubleshooting:\n" +
                "- If this is a 404, verify the issue key/ID exists and you have access.\n" +
                "- If this is a 401/403, verify JIRA_HOST, JIRA_EMAIL_ADDRESS, and JIRA_API_TOKEN.\n",
            },
          ],
          isError: true,
        };
      }
    },
  );
};
