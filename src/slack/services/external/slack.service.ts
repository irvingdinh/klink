import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { WebClient } from "@slack/web-api";

import { EnvService } from "../../../core/service/env.service.ts";

let instance: SlackService;

export const getSlackService = (): SlackService => {
  if (!instance) instance = new SlackService();
  return instance;
};

export class SlackService {
  private readonly client: WebClient;
  private readonly token: string;

  constructor() {
    this.token = EnvService.getRequiredEnv(
      "SLACK_API_TOKEN",
      "Set it to your Slack bot token (xoxb-...).",
    );
    this.client = new WebClient(this.token);
  }

  async getConversationHistory({
    conversationId,
    limit,
    cursor,
  }: {
    conversationId: string;
    limit: number;
    cursor?: string;
  }) {
    const result = await this.client.conversations.history({
      channel: conversationId,
      limit,
      cursor,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async getConversationReplies({
    conversationId,
    threadTs,
    limit,
    cursor,
  }: {
    conversationId: string;
    threadTs: string;
    limit: number;
    cursor?: string;
  }) {
    const result = await this.client.conversations.replies({
      channel: conversationId,
      ts: threadTs,
      limit,
      cursor,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async postMessage({
    conversationId,
    text,
    threadTs,
  }: {
    conversationId: string;
    text: string;
    threadTs?: string;
  }) {
    const result = await this.client.chat.postMessage({
      channel: conversationId,
      text,
      thread_ts: threadTs,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async updateMessage({
    conversationId,
    messageTs,
    text,
  }: {
    conversationId: string;
    messageTs: string;
    text: string;
  }) {
    const result = await this.client.chat.update({
      channel: conversationId,
      ts: messageTs,
      text,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async addReaction({
    conversationId,
    messageTs,
    emoji,
  }: {
    conversationId: string;
    messageTs: string;
    emoji: string;
  }) {
    const result = await this.client.reactions.add({
      channel: conversationId,
      timestamp: messageTs,
      name: emoji,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async getUser({ userId }: { userId: string }) {
    const result = await this.client.users.info({
      user: userId,
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async listChannels({ limit, cursor }: { limit: number; cursor?: string }) {
    const result = await this.client.conversations.list({
      limit,
      cursor,
      types: "public_channel,private_channel",
    });

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result;
  }

  async uploadFile({
    conversationId,
    file,
    threadTs,
    fileName,
  }: {
    conversationId: string;
    file: string;
    threadTs?: string;
    fileName?: string;
  }) {
    const args: any = {
      channel_id: conversationId,
      file: file,
      thread_ts: threadTs,
      filename: fileName ?? (basename(file) || "file"),
    };

    const result = await this.client.files.uploadV2(args);
    if (!result.ok) {
      throw new Error(result.error ?? "Unknown Slack API error");
    }

    return result;
  }

  async getFileInfo({ fileId }: { fileId: string }) {
    const result = await this.client.files.info({
      file: fileId,
    });

    if (!result.ok) {
      throw new Error(result.error ?? "Unknown Slack API error");
    }

    return result;
  }

  async downloadFile({
    fileId,
    destinationPath,
  }: {
    fileId: string;
    destinationPath?: string;
  }): Promise<string> {
    const fileInfo = await this.getFileInfo({ fileId });
    const file = fileInfo.file;

    if (!file) {
      throw new Error(`File ${fileId} not found or you don't have access.`);
    }

    const downloadUrl = file.url_private_download ?? file.url_private;
    if (!downloadUrl) {
      throw new Error(
        `File ${fileId} does not have a downloadable URL. ` +
          "It may be an external file or you don't have permission.",
      );
    }

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`,
      );
    }

    const fileName = file.name ?? `slack-file-${fileId}`;
    const outputPath = destinationPath ?? join(tmpdir(), fileName);

    const arrayBuffer = await response.arrayBuffer();
    await writeFile(outputPath, Buffer.from(arrayBuffer));

    return outputPath;
  }
}
