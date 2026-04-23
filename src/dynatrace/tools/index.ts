import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetEntityTool } from "./get-entity.tool.ts";
import { registerGetEventTool } from "./get-event.tool.ts";
import { registerGetMetricTool } from "./get-metric.tool.ts";
import { registerGetProblemTool } from "./get-problem.tool.ts";
import { registerGetSloTool } from "./get-slo.tool.ts";
import { registerListEntitiesTool } from "./list-entities.tool.ts";
import { registerListEntityTypesTool } from "./list-entity-types.tool.ts";
import { registerListEventsTool } from "./list-events.tool.ts";
import { registerListMetricsTool } from "./list-metrics.tool.ts";
import { registerListProblemsTool } from "./list-problems.tool.ts";
import { registerListSlosTool } from "./list-slos.tool.ts";
import { registerQueryMetricsTool } from "./query-metrics.tool.ts";

export const registerDynatraceTools = (server: McpServer) => {
  registerQueryMetricsTool(server);
  registerListMetricsTool(server);
  registerGetMetricTool(server);
  registerListEntitiesTool(server);
  registerGetEntityTool(server);
  registerListProblemsTool(server);
  registerGetProblemTool(server);
  registerListEventsTool(server);
  registerGetEventTool(server);
  registerListSlosTool(server);
  registerGetSloTool(server);
  registerListEntityTypesTool(server);
};
