import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetEpicTool } from "./get-epic.tool.ts";
import { registerGetFeatureTool } from "./get-feature.tool.ts";
import { registerGetIdeaTool } from "./get-idea.tool.ts";
import { registerGetProductTool } from "./get-product.tool.ts";
import { registerGetReleaseTool } from "./get-release.tool.ts";
import { registerGetRequirementTool } from "./get-requirement.tool.ts";
import { registerListCommentsTool } from "./list-comments.tool.ts";
import { registerListEpicsTool } from "./list-epics.tool.ts";
import { registerListFeaturesTool } from "./list-features.tool.ts";
import { registerListIdeasTool } from "./list-ideas.tool.ts";
import { registerListProductsTool } from "./list-products.tool.ts";
import { registerListReleasesTool } from "./list-releases.tool.ts";
import { registerListRequirementsTool } from "./list-requirements.tool.ts";

export const registerAhaTools = (server: McpServer) => {
  registerGetEpicTool(server);
  registerGetFeatureTool(server);
  registerGetIdeaTool(server);
  registerGetProductTool(server);
  registerGetReleaseTool(server);
  registerGetRequirementTool(server);
  registerListCommentsTool(server);
  registerListEpicsTool(server);
  registerListFeaturesTool(server);
  registerListIdeasTool(server);
  registerListProductsTool(server);
  registerListReleasesTool(server);
  registerListRequirementsTool(server);
};
