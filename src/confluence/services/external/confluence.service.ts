import TurndownService from "turndown";

import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: ConfluenceService;

export const getConfluenceService = (): ConfluenceService => {
  if (!instance) instance = new ConfluenceService();
  return instance;
};

export class ConfluenceService {
  private readonly config: ConfluenceClientConfig;
  private readonly turndown: TurndownService;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "CONFLUENCE_HOST",
        "Set it to your Confluence base URL, e.g. 'https://wiki.ariba.com'.",
      ).replace(/\/+$/, ""),
      apiToken: EnvService.getRequiredEnv(
        "CONFLUENCE_API_TOKEN",
        "Set it to a Confluence Personal Access Token (PAT).",
      ),
    };

    this.turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
  }

  async getPage({
    pageId,
    expand = "space,version,body.view,body.storage,metadata.labels,ancestors,children.attachment",
  }: {
    pageId: string;
    expand?: string;
  }): Promise<any> {
    const response = await this.fetchWithRetry(
      this.makeUrl("content", pageId) + "?" + new URLSearchParams({ expand }),
      this.makeAuth(),
      "getPage",
    );

    if (!response.ok) {
      throw await makeError("getPage", response);
    }

    const data = await response.json();

    // Enrich raw API response with Markdown-converted body for AI consumption.
    // Other services return response.json() directly, but Confluence HTML requires
    // transformation — done here to avoid duplicating turndown logic across tools.
    if (data.body?.view?.value) {
      data.body.view.markdown = this.turndown.turndown(data.body.view.value);
    }

    return data;
  }

  async searchPages({
    cql,
    start = 0,
    limit = 25,
    expand = "space,version",
  }: {
    cql: string;
    start?: number;
    limit?: number;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      cql,
      start: start.toString(),
      limit: limit.toString(),
      expand,
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("content", "search") + "?" + params.toString(),
      this.makeAuth(),
      "searchPages",
    );

    if (!response.ok) {
      throw await makeError("searchPages", response);
    }

    return response.json();
  }

  async listChildPages({
    pageId,
    start = 0,
    limit = 25,
    expand = "version",
  }: {
    pageId: string;
    start?: number;
    limit?: number;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      expand,
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("content", pageId, "child", "page") +
        "?" +
        params.toString(),
      this.makeAuth(),
      "listChildPages",
    );

    if (!response.ok) {
      throw await makeError("listChildPages", response);
    }

    return response.json();
  }

  async listSpaces({
    start = 0,
    limit = 25,
    type,
  }: {
    start?: number;
    limit?: number;
    type?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
    });
    if (type) params.set("type", type);

    const response = await this.fetchWithRetry(
      this.makeUrl("space") + "?" + params.toString(),
      this.makeAuth(),
      "listSpaces",
    );

    if (!response.ok) {
      throw await makeError("listSpaces", response);
    }

    return response.json();
  }

  async getSpace({
    spaceKey,
    expand = "description.plain,homepage",
  }: {
    spaceKey: string;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({ expand });

    const response = await this.fetchWithRetry(
      this.makeUrl("space", spaceKey) + "?" + params.toString(),
      this.makeAuth(),
      "getSpace",
    );

    if (!response.ok) {
      throw await makeError("getSpace", response);
    }

    return response.json();
  }

  async listComments({
    pageId,
    start = 0,
    limit = 25,
    expand = "body.view,version,extensions.inlineProperties,extensions.resolution",
  }: {
    pageId: string;
    start?: number;
    limit?: number;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      expand,
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("content", pageId, "child", "comment") +
        "?" +
        params.toString(),
      this.makeAuth(),
      "listComments",
    );

    if (!response.ok) {
      throw await makeError("listComments", response);
    }

    const data = await response.json();

    // Enrich raw API response with Markdown — same rationale as getPage above.
    if (data.results) {
      for (const comment of data.results) {
        if (comment.body?.view?.value) {
          comment.body.view.markdown = this.turndown.turndown(
            comment.body.view.value,
          );
        }
      }
    }

    return data;
  }

  async listAttachments({
    pageId,
    start = 0,
    limit = 25,
    expand = "version",
  }: {
    pageId: string;
    start?: number;
    limit?: number;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      expand,
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("content", pageId, "child", "attachment") +
        "?" +
        params.toString(),
      this.makeAuth(),
      "listAttachments",
    );

    if (!response.ok) {
      throw await makeError("listAttachments", response);
    }

    return response.json();
  }

  resolvePageId(pageIdOrUrl: string): string {
    if (/^\d+$/.test(pageIdOrUrl)) {
      return pageIdOrUrl;
    }

    try {
      const parsed = new URL(pageIdOrUrl);

      const pageIdParam = parsed.searchParams.get("pageId");
      if (pageIdParam && /^\d+$/.test(pageIdParam)) return pageIdParam;

      const pagesMatch = parsed.pathname.match(/\/pages\/(\d+)/);
      if (pagesMatch) return pagesMatch[1]!;
    } catch {
      // Not a valid URL
    }

    throw new Error(
      `Could not resolve page ID from "${pageIdOrUrl}". ` +
        "Provide a numeric page ID (e.g., '123456') or a Confluence URL " +
        "(e.g., 'https://wiki.example.com/pages/123456/Title' or '?pageId=123456').",
    );
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    action: string,
  ): Promise<Response> {
    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, options);

      if (response.status !== 429 && response.status !== 503) {
        return response;
      }

      if (attempt === maxRetries) {
        return response;
      }

      // Respect Retry-After but enforce a floor from the rate limit interval
      // (some servers send Retry-After: 0 while the rate window hasn't cleared).
      const retryAfterHeader = response.headers.get("Retry-After");
      const intervalHeader = response.headers.get(
        "X-RateLimit-Interval-Seconds",
      );
      const retryAfterMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : baseDelay * Math.pow(2, attempt);
      const floorMs = intervalHeader
        ? parseInt(intervalHeader, 10) * 1000
        : baseDelay;
      const delay = Math.max(retryAfterMs, floorMs);
      const jitter = Math.random() * 500;

      console.error(
        `[confluence] ${action}: ${response.status} rate limited, retrying in ${((delay + jitter) / 1000).toFixed(1)}s (attempt ${attempt + 1}/${maxRetries})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }

    throw new Error(`${action}: unreachable`);
  }

  private makeUrl(...paths: string[]): string {
    return `${this.config.host}/rest/api/${paths.filter((p) => p).join("/")}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.config.apiToken}`,
        ...options.headers,
      },
    };
  }
}

type ConfluenceClientConfig = {
  host: string;
  apiToken: string;
};
