import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { FileService } from "../../core/service/file.service.ts";
import { getJiraService } from "../services/external/jira.service.ts";

const inputSchema = {
  jql: z
    .string()
    .describe(
      "JQL (Jira Query Language) query string to search for issues. Example: 'project = PROJ AND status = Open'",
    ),
  startAt: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Index of the first result to return (0-based pagination)"),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of results to return (1-100)"),
  fields: z
    .string()
    .default(
      "summary,issuetype,status,priority,assignee,reporter,created,updated,project",
    )
    .describe(
      "Comma-separated list of fields to include in the response. Defaults to common fields. Use '*all' for all fields or '*navigable' for navigable fields.",
    ),
  expand: z
    .string()
    .default("renderedFields,names")
    .describe(
      "Comma-separated list of expand options for additional issue data. Defaults to 'renderedFields,names'.",
    ),
};

export const registerSearchIssuesTool = (server: McpServer) => {
  server.registerTool(
    "jira_search_issues",
    {
      description:
        "Search for JIRA issues using JQL (Jira Query Language). Use this when you need to find issues by criteria; use jira_get_issue if you already know the specific issue key/ID. Returns matching issues with their details. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    async ({ jql, startAt, maxResults, fields, expand }) => {
      try {
        const jiraService = getJiraService();
        const result = await jiraService.searchIssues({
          jql,
          startAt,
          maxResults,
          fields,
          expand,
        });

        const outputFilePath = await FileService.writeTemporaryTextOutput(
          "jira",
          "search-issues",
          JSON.stringify(result, null, 2),
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
                `Error searching issues with JQL '${jql}': ${message}\n\n` +
                "Troubleshooting:\n" +
                "- Verify the JQL syntax (example: 'project = PROJ AND status = Open').\n" +
                "- If this is a 401/403, verify JIRA_HOST, JIRA_EMAIL_ADDRESS, and JIRA_API_TOKEN.\n",
            },
          ],
          isError: true,
        };
      }
    },
  );
};
