import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getSlackService } from "../services/external/slack.service.ts";

const inputSchema = {
  userId: z
    .string()
    .describe("The ID of the Slack user to retrieve. Example: 'U01ABC123'"),
};

export const registerGetUserTool = (server: McpServer) => {
  server.registerTool(
    "slack_get_user",
    {
      description:
        "Get information about a Slack user by their user ID. " +
        "Returns user profile including display name, real name, email, and status. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema,
    },
    withErrorHandling(
      withTemporaryTextOutput("slack", "get-user", async ({ userId }) => {
        const slackService = getSlackService();
        const result = await slackService.getUser({ userId });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
