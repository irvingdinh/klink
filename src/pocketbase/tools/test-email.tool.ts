import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  email: z
    .string()
    .describe(
      "Email address to send the test email to. Example: 'test@example.com'",
    ),
  template: z
    .enum(["verification", "password-reset", "email-change"])
    .default("verification")
    .describe(
      "Email template to use. Options: 'verification', 'password-reset', 'email-change'.",
    ),
};

export const registerTestEmailTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_test_email",
    {
      description:
        "Send a test email to verify SMTP configuration. Sends a test email using the specified template. Returns success or detailed error message.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ email, template }) => {
        const pocketbaseService = getPocketBaseService();
        await pocketbaseService.testEmail({ email, template });

        return JSON.stringify({ ok: true, sent_to: email, template }, null, 2);
      }),
    ),
  );
};
