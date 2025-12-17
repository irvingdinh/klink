import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getGithubService } from "../services/external/github.service.ts";

const inputSchema = {
  owner: z
    .string()
    .describe(
      "The account owner of the repository. Example: 'platform' for platform/playground",
    ),
  repo: z
    .string()
    .describe(
      "The name of the repository without the .git extension. Example: 'playground'",
    ),
  pullNumber: z
    .number()
    .int()
    .min(1)
    .describe("The pull request number. Example: 1"),
  body: z
    .string()
    .optional()
    .describe("The text of the review comment. Supports GitHub Markdown."),
  bodyFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the comment text. Use this for large comments. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
  commitId: z
    .string()
    .describe(
      "The SHA of the commit to comment on. Get this from github_get_pull_request (head.sha field). " +
        "Example: 'abc123def456...'",
    ),
  path: z
    .string()
    .describe(
      "The relative path of the file to comment on. Example: 'src/index.ts'",
    ),
  line: z
    .number()
    .int()
    .min(1)
    .describe(
      "The line number in the diff to attach the comment to. This is the line number in the NEW version of the file.",
    ),
  side: z
    .enum(["LEFT", "RIGHT"])
    .default("RIGHT")
    .describe(
      "Which side of the diff to comment on. 'RIGHT' (default) for the new version, 'LEFT' for the old version.",
    ),
};

export const registerAddPrCommentTool = (server: McpServer) => {
  server.registerTool(
    "github_add_pr_comment",
    {
      description:
        "Add an inline review comment on a specific file and line in a GitHub pull request. " +
        "Use this to provide feedback on specific code changes. " +
        "Requires the commit SHA (from github_get_pull_request), file path, and line number.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({
          owner,
          repo,
          pullNumber,
          body,
          bodyFile,
          commitId,
          path,
          line,
          side,
        }) => {
          const resolvedBody = await resolveContent(body, bodyFile, "body");

          const githubService = getGithubService();
          const comment = await githubService.addPullRequestComment({
            owner,
            repo,
            pullNumber,
            body: resolvedBody,
            commitId,
            path,
            line,
            side,
          });

          return `Comment added successfully. ID: ${comment.id}, URL: ${comment.html_url}`;
        },
      ),
    ),
  );
};
