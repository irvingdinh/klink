import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  filesystem: z
    .enum(["storage", "backups"])
    .default("storage")
    .describe(
      "The filesystem to test. 'storage' for file storage or 'backups' for backup storage.",
    ),
};

export const registerTestS3Tool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_test_s3",
    {
      description:
        "Test the S3 storage connection. Verifies that the configured S3 credentials and bucket are accessible. Returns success or detailed error message.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ filesystem }) => {
        const pocketbaseService = getPocketBaseService();
        await pocketbaseService.testS3({ filesystem });

        return JSON.stringify({ ok: true, tested: filesystem }, null, 2);
      }),
    ),
  );
};
