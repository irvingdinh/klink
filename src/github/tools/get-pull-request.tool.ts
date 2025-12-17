import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
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
};

export const registerGetPullRequestTool = (server: McpServer) => {
  server.registerTool(
    "github_get_pull_request",
    {
      description:
        "Get a GitHub pull request by number, including metadata (title, body, author, state, reviewers, merge status) " +
        "AND all review comments. Use this as the first step when reviewing a PR. " +
        "Use github_get_pr_diff to see the actual code changes. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "github",
        "get-pull-request",
        async ({ owner, repo, pullNumber }) => {
          const githubService = getGithubService();

          const [pullRequest, comments] = await Promise.all([
            githubService.getPullRequest({ owner, repo, pullNumber }),
            githubService.getPullRequestComments({ owner, repo, pullNumber }),
          ]);

          return JSON.stringify(
            {
              pullRequest,
              comments,
            },
            null,
            2,
          );
        },
      ),
    ),
  );
};
