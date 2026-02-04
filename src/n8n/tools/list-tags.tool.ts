import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  withErrorHandling,
  withTemporaryTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getN8nService } from "../services/external/n8n.service.ts";

export const registerListTagsTool = (server: McpServer) => {
  server.registerTool(
    "n8n_list_tags",
    {
      description:
        "List all tags available in the n8n instance. " +
        "Tags can be used to categorize and filter workflows. " +
        "Use the tag names with n8n_list_workflows to filter workflows by tag. " +
        "Results are written to a temporary file as JSON and the file path is returned.",
      inputSchema: {},
    },
    withErrorHandling(
      withTemporaryTextOutput("n8n", "list-tags", async () => {
        const service = getN8nService();
        const result = await service.listTags();

        return JSON.stringify(result, null, 2);
      }),
    ),
  );
};
