import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAddPrCommentTool } from "./add-pr-comment.tool.ts";
import { registerGetPrDiffTool } from "./get-pr-diff.tool.ts";
import { registerGetPullRequestTool } from "./get-pull-request.tool.ts";
import { registerSubmitReviewTool } from "./submit-review.tool.ts";

export const registerGithubTools = (server: McpServer) => {
  // Read tools
  registerGetPullRequestTool(server);
  registerGetPrDiffTool(server);

  // Write tools
  registerAddPrCommentTool(server);
  registerSubmitReviewTool(server);
};
