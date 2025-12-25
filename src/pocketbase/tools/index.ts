import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Collections
import { registerCreateCollectionTool } from "./create-collection.tool.ts";
// Records
import { registerCreateRecordTool } from "./create-record.tool.ts";
import { registerDeleteCollectionTool } from "./delete-collection.tool.ts";
import { registerDeleteRecordTool } from "./delete-record.tool.ts";
// Files
import { registerGenerateFileTokenTool } from "./generate-file-token.tool.ts";
import { registerGetCollectionTool } from "./get-collection.tool.ts";
import { registerGetFileUrlTool } from "./get-file-url.tool.ts";
// Logs
import { registerGetLogTool } from "./get-log.tool.ts";
import { registerGetLogStatsTool } from "./get-log-stats.tool.ts";
import { registerGetRecordTool } from "./get-record.tool.ts";
// Settings
import { registerGetSettingsTool } from "./get-settings.tool.ts";
// Auth
import { registerImpersonateUserTool } from "./impersonate-user.tool.ts";
import { registerListCollectionsTool } from "./list-collections.tool.ts";
import { registerListLogsTool } from "./list-logs.tool.ts";
import { registerListRecordsTool } from "./list-records.tool.ts";
import { registerTestEmailTool } from "./test-email.tool.ts";
import { registerTestS3Tool } from "./test-s3.tool.ts";
import { registerTruncateCollectionTool } from "./truncate-collection.tool.ts";
import { registerUpdateCollectionTool } from "./update-collection.tool.ts";
import { registerUpdateRecordTool } from "./update-record.tool.ts";
import { registerUpdateSettingsTool } from "./update-settings.tool.ts";

export const registerPocketbaseTools = (server: McpServer) => {
  // Collections
  registerListCollectionsTool(server);
  registerGetCollectionTool(server);
  registerCreateCollectionTool(server);
  registerUpdateCollectionTool(server);
  registerDeleteCollectionTool(server);
  registerTruncateCollectionTool(server);

  // Records
  registerListRecordsTool(server);
  registerGetRecordTool(server);
  registerCreateRecordTool(server);
  registerUpdateRecordTool(server);
  registerDeleteRecordTool(server);

  // Settings
  registerGetSettingsTool(server);
  registerUpdateSettingsTool(server);
  registerTestS3Tool(server);
  registerTestEmailTool(server);

  // Logs
  registerListLogsTool(server);
  registerGetLogTool(server);
  registerGetLogStatsTool(server);

  // Files
  registerGetFileUrlTool(server);
  registerGenerateFileTokenTool(server);

  // Auth
  registerImpersonateUserTool(server);
};
