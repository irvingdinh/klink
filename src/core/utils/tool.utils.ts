import { tmpdir } from "node:os";

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

export const withTextOutput = <TArgs>(
  handler: (
    args: TArgs,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => string | Promise<string>,
): ToolHandler<TArgs> => {
  return async (args, extra) => {
    const text = await handler(args, extra);
    return {
      content: [{ type: "text", text }],
    };
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

export const getTempDir = (): string => tmpdir();

export const resolveContent = async (
  content: string | undefined,
  contentFile: string | undefined,
  paramName: string = "content",
): Promise<string> => {
  if (content && contentFile) {
    throw new Error(
      `Both ${paramName} and ${paramName}File provided. Use one or the other.`,
    );
  }
  if (!content && !contentFile) {
    throw new Error(`Either ${paramName} or ${paramName}File is required.`);
  }
  if (contentFile) {
    const file = Bun.file(contentFile);
    if (!(await file.exists())) {
      throw new Error(
        `File not found: ${contentFile}. Ensure the file exists and the path is absolute.`,
      );
    }
    return await file.text();
  }
  return content!;
};
