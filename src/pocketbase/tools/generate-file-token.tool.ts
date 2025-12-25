import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

export const registerGenerateFileTokenTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_generate_file_token",
    {
      description:
        "Generate a temporary file access token for protected files. The token is valid for a limited time and can be passed to pocketbase_get_file_url. Returns the token string.",
      inputSchema: {},
    },
    withErrorHandling(
      withTextOutput(async () => {
        const pocketbaseService = getPocketBaseService();
        const token = await pocketbaseService.generateFileToken();

        return JSON.stringify({ token }, null, 2);
      }),
    ),
  );
};
