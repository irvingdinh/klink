import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: QuipService;

export const getQuipService = (): QuipService => {
  if (!instance) instance = new QuipService();
  return instance;
};

export class QuipService {
  private readonly config: QuipClientConfig;

  constructor() {
    this.config = {
      host: "https://platform.quip.com/1",
      apiToken: EnvService.getRequiredEnv(
        "QUIP_API_TOKEN",
        "Set it to your Quip API token. Get one at https://quip.com/dev/token",
      ),
    };
  }

  async getThread({ threadId }: { threadId: string }): Promise<QuipThread> {
    const response = await fetch(
      this.makeUrl("threads", threadId),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getThread", response);
    }

    return response.json() as Promise<QuipThread>;
  }

  async getFolder({ folderId }: { folderId: string }): Promise<QuipFolder> {
    const response = await fetch(
      this.makeUrl("folders", folderId),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getFolder", response);
    }

    return response.json() as Promise<QuipFolder>;
  }

  async searchThreads({
    query,
    count = 10,
    onlyMatchTitles = false,
  }: {
    query: string;
    count?: number;
    onlyMatchTitles?: boolean;
  }): Promise<QuipThread[]> {
    const params = new URLSearchParams({
      query,
      count: count.toString(),
      only_match_titles: onlyMatchTitles.toString(),
    });

    const response = await fetch(
      this.makeUrl("threads", "search") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("searchThreads", response);
    }

    return response.json() as Promise<QuipThread[]>;
  }

  async getRecentThreads({
    count = 10,
    maxUpdatedUsec,
  }: {
    count?: number;
    maxUpdatedUsec?: number;
  } = {}): Promise<QuipThread[]> {
    const params = new URLSearchParams({
      count: count.toString(),
    });

    if (maxUpdatedUsec)
      params.set("max_updated_usec", maxUpdatedUsec.toString());

    const response = await fetch(
      this.makeUrl("threads", "recent") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getRecentThreads", response);
    }

    return response.json() as Promise<QuipThread[]>;
  }

  async getMessages({
    threadId,
    count = 25,
    maxCreatedUsec,
  }: {
    threadId: string;
    count?: number;
    maxCreatedUsec?: number;
  }): Promise<QuipMessage[]> {
    const params = new URLSearchParams({
      count: count.toString(),
    });

    if (maxCreatedUsec !== undefined)
      params.set("max_created_usec", maxCreatedUsec.toString());

    const response = await fetch(
      this.makeUrl("messages", threadId) + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getMessages", response);
    }

    return response.json() as Promise<QuipMessage[]>;
  }

  async createDocument({
    title,
    content,
    memberIds,
    format = "markdown",
  }: {
    title: string;
    content: string;
    memberIds?: string[];
    format?: "html" | "markdown";
  }): Promise<QuipThread> {
    const body: Record<string, string> = {
      title,
      content,
      format,
    };

    if (memberIds && memberIds.length > 0) {
      body.member_ids = memberIds.join(",");
    }

    const response = await fetch(
      this.makeUrl("threads", "new-document"),
      this.makeAuth({
        method: "POST",
        body: new URLSearchParams(body),
      }),
    );

    if (!response.ok) {
      throw await makeError("createDocument", response);
    }

    return response.json() as Promise<QuipThread>;
  }

  async editDocument({
    threadId,
    content,
    sectionId,
    operation = "append",
    format = "markdown",
  }: {
    threadId: string;
    content: string;
    sectionId?: string;
    operation?:
      | "prepend"
      | "append"
      | "replace"
      | "delete"
      | "after_section"
      | "before_section";
    format?: "html" | "markdown";
  }): Promise<QuipThread> {
    const body: Record<string, string> = {
      thread_id: threadId,
      content,
      format,
    };

    if (sectionId) body.section_id = sectionId;

    // Quip API location values:
    // 0: REPLACE_SECTION (requires section_id)
    // 1: PREPEND (to document start, no section_id needed)
    // 2: APPEND (to document end, no section_id needed)
    // 3: AFTER_SECTION (requires section_id)
    // 4: BEFORE_SECTION (requires section_id)
    // 5: DELETE_SECTION (requires section_id)
    //
    // For document-level append/prepend, only set location without section_id
    // For section operations, we need both location and section_id
    if (operation === "append" || operation === "prepend") {
      // For document-level operations, don't include location - API defaults to append
      // Including location without section_id causes errors on some Quip instances
      // We'll rely on default behavior (append to end)
    } else if (sectionId) {
      const locationMap: Record<string, number> = {
        replace: 0,
        after_section: 3,
        before_section: 4,
        delete: 5,
      };
      if (locationMap[operation] !== undefined) {
        body.location = locationMap[operation].toString();
      }
    }

    const response = await fetch(
      this.makeUrl("threads", "edit-document"),
      this.makeAuth({
        method: "POST",
        body: new URLSearchParams(body),
      }),
    );

    if (!response.ok) {
      throw await makeError("editDocument", response);
    }

    return response.json() as Promise<QuipThread>;
  }

  async newMessage({
    threadId,
    content,
    sectionId,
    annotationId,
  }: {
    threadId: string;
    content: string;
    sectionId?: string;
    annotationId?: string;
  }): Promise<QuipMessage> {
    const body: Record<string, string> = {
      thread_id: threadId,
      content,
    };

    if (sectionId) body.section_id = sectionId;
    if (annotationId) body.annotation_id = annotationId;

    const response = await fetch(
      this.makeUrl("messages", "new"),
      this.makeAuth({
        method: "POST",
        body: new URLSearchParams(body),
      }),
    );

    if (!response.ok) {
      throw await makeError("newMessage", response);
    }

    return response.json() as Promise<QuipMessage>;
  }

  private makeUrl(...paths: string[]): string {
    return `${this.config.host}/${paths.filter((p) => p).join("/")}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  }
}

type QuipClientConfig = {
  host: string;
  apiToken: string;
};

export type QuipThread = {
  thread: {
    id: string;
    title: string;
    link: string;
    created_usec: number;
    updated_usec: number;
    author_id: string;
    type: string;
    document_id?: string;
    sharing?: {
      company_id?: string;
      company_mode?: string;
    };
  };
  html?: string;
  user_ids?: string[];
  shared_folder_ids?: string[];
  expanded_user_ids?: string[];
};

export type QuipFolder = {
  folder: {
    id: string;
    title: string;
    created_usec: number;
    updated_usec: number;
    creator_id: string;
    parent_id?: string;
  };
  member_ids?: string[];
  children?: Array<{
    thread_id?: string;
    folder_id?: string;
  }>;
};

export type QuipMessage = {
  id: string;
  author_id: string;
  text: string;
  created_usec: number;
  annotation?: {
    id: string;
    highlight_section_ids?: string[];
  };
};
