import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTempDir,
  resolveContent,
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getPocketBaseService } from "../services/external/pocketbase.service.ts";

const inputSchema = {
  settings: z
    .string()
    .optional()
    .describe(
      'JSON string containing settings to update. Example: \'{"meta":{"appName":"My App"}}\'',
    ),
  settingsFile: z
    .string()
    .optional()
    .describe(
      `Absolute path to a JSON file containing settings. Write the file to the system temp directory (${getTempDir()}) then provide the path here.`,
    ),
};

export const registerUpdateSettingsTool = (server: McpServer) => {
  server.registerTool(
    "pocketbase_update_settings",
    {
      description:
        "Update Pocketbase application settings. Only provided settings will be updated. Use pocketbase_get_settings first to see current values and available options. Returns confirmation of update.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(async ({ settings, settingsFile }) => {
        const resolvedSettings = await resolveContent(
          settings,
          settingsFile,
          "settings",
        );
        const parsedSettings = JSON.parse(resolvedSettings);

        const pocketbaseService = getPocketBaseService();
        const result = await pocketbaseService.updateSettings({
          data: parsedSettings,
        });

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
