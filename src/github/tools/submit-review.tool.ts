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
  event: z
    .enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"])
    .describe(
      "The review action to perform. " +
        "'APPROVE' - Approve the PR for merging. " +
        "'REQUEST_CHANGES' - Block the PR until changes are addressed. " +
        "'COMMENT' - Provide general feedback without explicit approval or rejection.",
    ),
  body: z
    .string()
    .optional()
    .describe(
      "The body text of the review. Required for REQUEST_CHANGES, optional for APPROVE and COMMENT. " +
        "Supports GitHub Markdown.",
    ),
  bodyFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a file containing the review body. Use this for large reviews. ` +
        `Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
};

export const registerSubmitReviewTool = (server: McpServer) => {
  server.registerTool(
    "github_submit_review",
    {
      description:
        "Submit a review on a GitHub pull request. Use this to approve, request changes, or leave a general comment on a PR. " +
        "For inline code comments, use github_add_pr_comment instead.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ owner, repo, pullNumber, event, body, bodyFile }) => {
          // For REQUEST_CHANGES, body is required
          let resolvedBody: string | undefined;
          if (body || bodyFile) {
            resolvedBody = await resolveContent(body, bodyFile, "body");
          } else if (event === "REQUEST_CHANGES") {
            throw new Error(
              "Body is required when requesting changes. Provide a 'body' or 'bodyFile' explaining what changes are needed.",
            );
          }

          const githubService = getGithubService();
          const review = await githubService.submitReview({
            owner,
            repo,
            pullNumber,
            event,
            body: resolvedBody,
          });

          const eventMessages: Record<string, string> = {
            APPROVE: "approved",
            REQUEST_CHANGES: "requested changes on",
            COMMENT: "commented on",
          };

          return `Review ${eventMessages[event]} PR successfully. Review ID: ${review.id}, State: ${review.state}, URL: ${review.html_url}`;
        },
      ),
    ),
  );
};
