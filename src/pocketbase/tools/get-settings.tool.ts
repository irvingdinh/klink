import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

export const registerGetSettingsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_get_settings",
    {
      description:
        "Get all Pocketbase application settings including SMTP, S3, backups, and authentication settings. Sensitive values like passwords may be masked. Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema: {},
    },
    withErrorHandling(
      withTemporaryTextOutput("pocketbase", "get-settings", async () => {
        const pocketbaseService = getPocketBaseService();
        const settings = await pocketbaseService.getSettings();

        return JSON.stringify(settings, null, 2);
      }),
    ),
  );
};
