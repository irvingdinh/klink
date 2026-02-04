import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerActivateWorkflowTool } from "./activate-workflow.tool.ts";
import { registerCreateWorkflowTool } from "./create-workflow.tool.ts";
import { registerDeactivateWorkflowTool } from "./deactivate-workflow.tool.ts";
import { registerDeleteExecutionTool } from "./delete-execution.tool.ts";
import { registerDeleteWorkflowTool } from "./delete-workflow.tool.ts";
import { registerGetExecutionTool } from "./get-execution.tool.ts";
import { registerGetWorkflowTool } from "./get-workflow.tool.ts";
import { registerListExecutionsTool } from "./list-executions.tool.ts";
import { registerListTagsTool } from "./list-tags.tool.ts";
import { registerListWorkflowsTool } from "./list-workflows.tool.ts";
import { registerUpdateWorkflowTool } from "./update-workflow.tool.ts";

export const registerN8nTools = (server: McpServer) => {
  // Read tools
  registerListWorkflowsTool(server);
  registerGetWorkflowTool(server);
  registerListExecutionsTool(server);
  registerGetExecutionTool(server);
  registerListTagsTool(server);

  // Write tools
  registerCreateWorkflowTool(server);
  registerUpdateWorkflowTool(server);
  registerDeleteWorkflowTool(server);
  registerActivateWorkflowTool(server);
  registerDeactivateWorkflowTool(server);
  registerDeleteExecutionTool(server);
};
