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

export const registerGetPrDiffTool = (server: McpServer) => {
  server.registerTool(
    "github_get_pr_diff",
    {
      description:
        "Get the unified diff of a GitHub pull request. Returns the raw diff text showing all file changes. " +
        "Use this to review the actual code changes in a PR; use github_get_pull_request first to get PR metadata and existing comments. " +
        "Results are written to a temporary file and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput(
        "github",
        "get-pr-diff",
        async ({ owner, repo, pullNumber }) => {
          const githubService = getGithubService();
          const diff = await githubService.getPullRequestDiff({
            owner,
            repo,
            pullNumber,
          });

          return diff;
        },
      ),
    ),
  );
};
