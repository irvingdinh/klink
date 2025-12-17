import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: TelegramService;

export const getTelegramService = (): TelegramService => {
  if (!instance) instance = new TelegramService();
  return instance;
};

export class TelegramService {
  private readonly config: TelegramClientConfig;

  constructor() {
    this.config = {
      token: EnvService.getRequiredEnv(
        "TELEGRAM_BOT_TOKEN",
        "Set it to your Telegram bot token from @BotFather.",
      ),
    };
  }

  async sendMessage({
    chatId,
    text,
    replyToMessageId,
    parseMode,
  }: {
    chatId: string | number;
    text: string;
    replyToMessageId?: number;
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  }): Promise<TelegramMessage> {
    const response = await fetch(this.makeUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_to_message_id: replyToMessageId,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      throw await makeError("sendMessage", response);
    }

    return this.unwrapResult<TelegramMessage>(response);
  }

  async editMessageText({
    chatId,
    messageId,
    text,
    parseMode,
  }: {
    chatId: string | number;
    messageId: number;
    text: string;
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  }): Promise<TelegramMessage> {
    const response = await fetch(this.makeUrl("editMessageText"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      throw await makeError("editMessageText", response);
    }

    return this.unwrapResult<TelegramMessage>(response);
  }

  async deleteMessage({
    chatId,
    messageId,
  }: {
    chatId: string | number;
    messageId: number;
  }): Promise<boolean> {
    const response = await fetch(this.makeUrl("deleteMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      throw await makeError("deleteMessage", response);
    }

    return this.unwrapResult<boolean>(response);
  }

  async getChat({
    chatId,
  }: {
    chatId: string | number;
  }): Promise<TelegramChat> {
    const response = await fetch(this.makeUrl("getChat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    });

    if (!response.ok) {
      throw await makeError("getChat", response);
    }

    return this.unwrapResult<TelegramChat>(response);
  }

  async sendDocument({
    chatId,
    filePath,
    caption,
    replyToMessageId,
  }: {
    chatId: string | number;
    filePath: string;
    caption?: string;
    replyToMessageId?: number;
  }): Promise<TelegramMessage> {
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("document", file, basename(filePath));
    if (caption) formData.append("caption", caption);
    if (replyToMessageId)
      formData.append("reply_to_message_id", String(replyToMessageId));

    const response = await fetch(this.makeUrl("sendDocument"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw await makeError("sendDocument", response);
    }

    return this.unwrapResult<TelegramMessage>(response);
  }

  async sendPhoto({
    chatId,
    filePath,
    caption,
    replyToMessageId,
  }: {
    chatId: string | number;
    filePath: string;
    caption?: string;
    replyToMessageId?: number;
  }): Promise<TelegramMessage> {
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("photo", file, basename(filePath));
    if (caption) formData.append("caption", caption);
    if (replyToMessageId)
      formData.append("reply_to_message_id", String(replyToMessageId));

    const response = await fetch(this.makeUrl("sendPhoto"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw await makeError("sendPhoto", response);
    }

    return this.unwrapResult<TelegramMessage>(response);
  }

  async getFile({ fileId }: { fileId: string }): Promise<TelegramFile> {
    const response = await fetch(this.makeUrl("getFile"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_id: fileId,
      }),
    });

    if (!response.ok) {
      throw await makeError("getFile", response);
    }

    return this.unwrapResult<TelegramFile>(response);
  }

  async downloadFile({
    fileId,
    destinationPath,
  }: {
    fileId: string;
    destinationPath?: string;
  }): Promise<string> {
    const fileInfo = await this.getFile({ fileId });

    if (!fileInfo.file_path) {
      throw new Error("File path not available. The file may be too large.");
    }

    const response = await fetch(this.makeFileUrl(fileInfo.file_path));

    if (!response.ok) {
      throw await makeError("downloadFile", response);
    }

    const fileName = basename(fileInfo.file_path);
    const outputPath =
      destinationPath ?? join(tmpdir(), `telegram-${fileName}`);

    const arrayBuffer = await response.arrayBuffer();
    await Bun.write(outputPath, arrayBuffer);

    return outputPath;
  }

  async setMessageReaction({
    chatId,
    messageId,
    emoji,
  }: {
    chatId: string | number;
    messageId: number;
    emoji?: string;
  }): Promise<boolean> {
    const reaction = emoji ? [{ type: "emoji", emoji }] : [];

    const response = await fetch(this.makeUrl("setMessageReaction"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reaction,
      }),
    });

    if (!response.ok) {
      throw await makeError("setMessageReaction", response);
    }

    return this.unwrapResult<boolean>(response);
  }

  private makeUrl(method: string): string {
    return `https://api.telegram.org/bot${this.config.token}/${method}`;
  }

  private makeFileUrl(filePath: string): string {
    return `https://api.telegram.org/file/bot${this.config.token}/${filePath}`;
  }

  private async unwrapResult<T>(response: Response): Promise<T> {
    const data = (await response.json()) as TelegramResponse<T>;

    if (!data.ok) {
      throw new Error(
        `Telegram API error: ${data.description ?? "Unknown error"} (code: ${data.error_code ?? "unknown"})`,
      );
    }

    return data.result;
  }
}

type TelegramClientConfig = {
  token: string;
};

type TelegramResponse<T> = {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
};

type TelegramMessage = {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  document?: TelegramDocument;
  photo?: TelegramPhotoSize[];
};

type TelegramUser = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
};

type TelegramChat = {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  bio?: string;
};

type TelegramFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
};

type TelegramDocument = {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
};

type TelegramPhotoSize = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};
