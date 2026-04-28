import TurndownService from "turndown";

import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: AhaService;

export const getAhaService = (): AhaService => {
  if (!instance) instance = new AhaService();
  return instance;
};

export class AhaService {
  private readonly config: AhaClientConfig;
  private readonly turndown: TurndownService;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "AHA_HOST",
        "Set it to your Aha! base URL, e.g. 'https://your-company.aha.io'.",
      ).replace(/\/+$/, ""),
      apiToken: EnvService.getRequiredEnv(
        "AHA_API_TOKEN",
        "Set it to an Aha! API key (Settings > Personal > Developer > API key).",
      ),
    };

    this.turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
  }

  async listProducts({
    page = 1,
    perPage = 30,
  }: {
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("products") + "?" + params.toString(),
      this.makeAuth(),
      "listProducts",
    );

    if (!response.ok) {
      throw await makeError("listProducts", response);
    }

    return response.json();
  }

  async getProduct({
    productId,
    fields,
  }: {
    productId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("products", productId) + "?" + query
      : this.makeUrl("products", productId);

    const response = await this.fetchWithRetry(
      url,
      this.makeAuth(),
      "getProduct",
    );

    if (!response.ok) {
      throw await makeError("getProduct", response);
    }

    const data = await response.json();
    this.enrichDescription(data.product);
    return data;
  }

  async listReleases({
    productId,
    page = 1,
    perPage = 30,
  }: {
    productId: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("products", productId, "releases") + "?" + params.toString(),
      this.makeAuth(),
      "listReleases",
    );

    if (!response.ok) {
      throw await makeError("listReleases", response);
    }

    return response.json();
  }

  async getRelease({
    releaseId,
    fields,
  }: {
    releaseId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("releases", releaseId) + "?" + query
      : this.makeUrl("releases", releaseId);

    const response = await this.fetchWithRetry(
      url,
      this.makeAuth(),
      "getRelease",
    );

    if (!response.ok) {
      throw await makeError("getRelease", response);
    }

    const data = await response.json();
    this.enrichDescription(data.release);
    return data;
  }

  async listEpics({
    productId,
    releaseId,
    page = 1,
    perPage = 30,
  }: {
    productId?: string;
    releaseId?: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const basePath = releaseId
      ? this.makeUrl("releases", releaseId, "epics")
      : this.makeUrl("products", productId!, "epics");

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      basePath + "?" + params.toString(),
      this.makeAuth(),
      "listEpics",
    );

    if (!response.ok) {
      throw await makeError("listEpics", response);
    }

    return response.json();
  }

  async getEpic({
    epicId,
    fields,
  }: {
    epicId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("epics", epicId) + "?" + query
      : this.makeUrl("epics", epicId);

    const response = await this.fetchWithRetry(url, this.makeAuth(), "getEpic");

    if (!response.ok) {
      throw await makeError("getEpic", response);
    }

    const data = await response.json();
    this.enrichDescription(data.epic);
    return data;
  }

  async listFeatures({
    productId,
    releaseId,
    epicId,
    page = 1,
    perPage = 30,
  }: {
    productId?: string;
    releaseId?: string;
    epicId?: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    let basePath: string;
    if (epicId) {
      basePath = this.makeUrl("epics", epicId, "features");
    } else if (releaseId) {
      basePath = this.makeUrl("releases", releaseId, "features");
    } else {
      basePath = this.makeUrl("products", productId!, "features");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      basePath + "?" + params.toString(),
      this.makeAuth(),
      "listFeatures",
    );

    if (!response.ok) {
      throw await makeError("listFeatures", response);
    }

    return response.json();
  }

  async getFeature({
    featureId,
    fields,
  }: {
    featureId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("features", featureId) + "?" + query
      : this.makeUrl("features", featureId);

    const response = await this.fetchWithRetry(
      url,
      this.makeAuth(),
      "getFeature",
    );

    if (!response.ok) {
      throw await makeError("getFeature", response);
    }

    const data = await response.json();
    this.enrichDescription(data.feature);
    return data;
  }

  async listIdeas({
    productId,
    page = 1,
    perPage = 30,
  }: {
    productId: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("products", productId, "ideas") + "?" + params.toString(),
      this.makeAuth(),
      "listIdeas",
    );

    if (!response.ok) {
      throw await makeError("listIdeas", response);
    }

    return response.json();
  }

  async getIdea({
    ideaId,
    fields,
  }: {
    ideaId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("ideas", ideaId) + "?" + query
      : this.makeUrl("ideas", ideaId);

    const response = await this.fetchWithRetry(url, this.makeAuth(), "getIdea");

    if (!response.ok) {
      throw await makeError("getIdea", response);
    }

    const data = await response.json();
    this.enrichDescription(data.idea);
    return data;
  }

  async listComments({
    parentType,
    parentId,
    page = 1,
    perPage = 30,
  }: {
    parentType: string;
    parentId: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const pluralType = this.pluralizeParentType(parentType);
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      this.makeUrl(pluralType, parentId, "comments") + "?" + params.toString(),
      this.makeAuth(),
      "listComments",
    );

    if (!response.ok) {
      throw await makeError("listComments", response);
    }

    return response.json();
  }

  async listRequirements({
    featureId,
    page = 1,
    perPage = 30,
  }: {
    featureId: string;
    page?: number;
    perPage?: number;
  }): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.fetchWithRetry(
      this.makeUrl("features", featureId, "requirements") +
        "?" +
        params.toString(),
      this.makeAuth(),
      "listRequirements",
    );

    if (!response.ok) {
      throw await makeError("listRequirements", response);
    }

    return response.json();
  }

  async getRequirement({
    requirementId,
    fields,
  }: {
    requirementId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("requirements", requirementId) + "?" + query
      : this.makeUrl("requirements", requirementId);

    const response = await this.fetchWithRetry(
      url,
      this.makeAuth(),
      "getRequirement",
    );

    if (!response.ok) {
      throw await makeError("getRequirement", response);
    }

    const data = await response.json();
    this.enrichDescription(data.requirement);
    return data;
  }

  // Enrich raw API response with Markdown-converted description for AI consumption.
  // Aha! returns description.body as HTML — done here to avoid duplicating
  // turndown logic across tools (same rationale as Confluence service).
  private enrichDescription(record: any): void {
    if (record?.description?.body) {
      record.description.markdown = this.turndown.turndown(
        record.description.body,
      );
    }
  }

  private pluralizeParentType(type: string): string {
    const map: Record<string, string> = {
      feature: "features",
      epic: "epics",
      idea: "ideas",
      release: "releases",
    };
    return map[type] ?? type + "s";
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

      // Aha! returns X-Ratelimit-Reset as a Unix timestamp (seconds).
      // Compute wait time from the reset timestamp; fall back to exponential backoff.
      const resetHeader = response.headers.get("X-Ratelimit-Reset");
      let delay: number;
      if (resetHeader) {
        const resetEpochMs = parseInt(resetHeader, 10) * 1000;
        delay = Math.max(resetEpochMs - Date.now(), baseDelay);
      } else {
        delay = baseDelay * Math.pow(2, attempt);
      }
      const jitter = Math.random() * 500;

      console.error(
        `[aha] ${action}: ${response.status} rate limited, retrying in ${((delay + jitter) / 1000).toFixed(1)}s (attempt ${attempt + 1}/${maxRetries})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }

    throw new Error(`${action}: unreachable`);
  }

  private makeUrl(...paths: string[]): string {
    return `${this.config.host}/api/v1/${paths.filter((p) => p).join("/")}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.config.apiToken}`,
        "User-Agent": "klinklang-mcp",
        ...options.headers,
      },
    };
  }
}

type AhaClientConfig = {
  host: string;
  apiToken: string;
};
