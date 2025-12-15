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
};

export const registerGetIssueTool = (server: McpServer) => {
  server.registerTool(
    "jira_get_issue",
    {
      description:
        "Get a single JIRA issue by its ID or key. Results are written to a temporary file and the file path is returned.",
      inputSchema,
    },
    async ({ issueIdOrKey }) => {
      const jiraService = getJiraService();

      const issue = await jiraService.getIssue({
        issueIdOrKey,
        fields: "*all",
        expand: "renderedFields,names",
        properties: "",
        updateHistory: false,
        failFast: false,
      });

      const output = transformIssue(issue);

      const outputFilePath = await FileService.writeTemporaryTextOutput(
        "jira",
        "get-issue",
        JSON.stringify(output, null, 2),
      );

      return {
        content: [
          {
            type: "text",
            text: outputFilePath,
          },
        ],
      };
    },
  );
};

function transformIssue(rawIssue: any): any {
  if (!rawIssue) {
    return null;
  }

  const transformed: any = {
    id: rawIssue.id,
    key: rawIssue.key,
    url: rawIssue.self?.replace("/rest/api/3/issue/", "/browse/") ?? null,
    fields: {},
  };

  if (rawIssue.fields && rawIssue.names) {
    const fieldNames = rawIssue.names;
    const rendered = rawIssue.renderedFields ?? {};

    for (const [fieldKey, fieldValue] of Object.entries(rawIssue.fields)) {
      if (fieldValue === null || fieldValue === undefined) {
        continue;
      }

      const fieldName = fieldNames[fieldKey] || fieldKey;
      const simplifiedValue = simplifyValue(fieldKey, fieldValue, rendered);

      if (simplifiedValue !== null && simplifiedValue !== undefined) {
        transformed.fields[fieldKey] = {
          name: fieldName,
          value: simplifiedValue,
        };
      }
    }
  }

  return transformed;
}

function simplifyValue(fieldKey: string, value: any, rendered: any): any {
  if (isAdfDocument(value)) {
    return rendered[fieldKey] ?? null;
  }

  if (fieldKey === "comment" && value?.comments) {
    const renderedComments = rendered.comment?.comments ?? [];
    return value.comments.map((c: any, i: number) => ({
      author: c.author?.displayName ?? null,
      body: renderedComments[i]?.body ?? null,
      created: c.created ?? null,
    }));
  }

  if (isUserObject(value)) {
    return value.displayName;
  }

  if (isNamedObject(value)) {
    return value.name;
  }

  if (fieldKey === "parent" && value?.key) {
    return {
      key: value.key,
      summary: value.fields?.summary ?? null,
      status: value.fields?.status?.name ?? null,
      issuetype: value.fields?.issuetype?.name ?? null,
    };
  }

  if (Array.isArray(value)) {
    return value.map((v) => simplifyArrayElement(v));
  }

  return value;
}

function isAdfDocument(value: any): boolean {
  return (
    value &&
    typeof value === "object" &&
    value.type === "doc" &&
    typeof value.version === "number" &&
    Array.isArray(value.content)
  );
}

function isUserObject(value: any): boolean {
  return (
    value &&
    typeof value === "object" &&
    "displayName" in value &&
    "accountId" in value
  );
}

function isNamedObject(value: any): boolean {
  return (
    value &&
    typeof value === "object" &&
    "name" in value &&
    ("id" in value || "statusCategory" in value) &&
    !("displayName" in value)
  );
}

function simplifyArrayElement(value: any): any {
  if (isUserObject(value)) {
    return value.displayName;
  }

  if (isNamedObject(value)) {
    return value.name;
  }
  
  return value;
}
