import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  collection: z.string().describe("The auth collection name. Example: 'users'"),
  recordId: z.string().describe("The user record ID to impersonate."),
  duration: z
    .number()
    .int()
    .min(1)
    .default(3600)
    .describe("Token validity duration in seconds. Default: 3600 (1 hour)."),
};

export const registerImpersonateUserTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_impersonate_user",
    {
      description:
        "Generate an auth token to impersonate a user from an auth collection. This allows testing as a specific user without knowing their password. Returns the impersonation token and user details. Warning: Use with caution as this bypasses normal authentication.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ collection, recordId, duration }) => {
        const pocketbaseService = getPocketBaseService();
        const result = await pocketbaseService.impersonateUser({
          collection,
          id: recordId,
          duration,
        });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
