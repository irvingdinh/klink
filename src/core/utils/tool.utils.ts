import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";

import { FileService } from "../service/file.service";

type ToolHandler<TArgs> = (
  args: TArgs,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<CallToolResult>;

export const withErrorHandling = <TArgs>(
  handler: ToolHandler<TArgs>,
): ToolHandler<TArgs> => {
  return async (args, extra) => {
    try {
      return await handler(args, extra);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: message }],
        isError: true,
      };
    }
  };
};

export const withTemporaryTextOutput = <TArgs>(
  moduleRef: string,
  toolRef: string,
  handler: (
    args: TArgs,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => string | Promise<string>,
): ToolHandler<TArgs> => {
  return async (args, extra) => {
    const payload = await handler(args, extra);
    const outputFilePath = await FileService.writeTemporaryTextOutput(
      moduleRef,
      toolRef,
      payload,
    );

    return {
      content: [{ type: "text", text: outputFilePath }],
    };
  };
};
