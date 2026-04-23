import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: DynatraceService;

export const getDynatraceService = (): DynatraceService => {
  if (!instance) instance = new DynatraceService();
  return instance;
};

export class DynatraceService {
  private readonly config: DynatraceClientConfig;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "DYNATRACE_HOST",
        "Set it to your Dynatrace environment URL including the tenant path, e.g. 'https://live.eu10.apm.services.cloud.sap/e/your-tenant-id'.",
      ).replace(/\/+$/, ""),
      apiToken: EnvService.getRequiredEnv(
        "DYNATRACE_API_TOKEN",
        "Set it to a Dynatrace API token with read scopes for metrics, entities, problems, events, and SLOs.",
      ),
    };
  }

  async queryMetrics({
    metricSelector,
    resolution,
    from,
    to,
    entitySelector,
  }: {
    metricSelector: string;
    resolution?: string;
    from?: string;
    to?: string;
    entitySelector?: string;
  }): Promise<any> {
    const params = new URLSearchParams({ metricSelector });
    if (resolution) params.set("resolution", resolution);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (entitySelector) params.set("entitySelector", entitySelector);

    const response = await fetch(
      this.makeUrl("metrics", "query") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("queryMetrics", response);
    }

    return response.json();
  }

  async listMetrics({
    text,
    metricSelector,
    pageSize = 50,
    nextPageKey,
  }: {
    text?: string;
    metricSelector?: string;
    pageSize?: number;
    nextPageKey?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (text) params.set("text", text);
    if (metricSelector) params.set("metricSelector", metricSelector);
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);

    const response = await fetch(
      this.makeUrl("metrics") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listMetrics", response);
    }

    return response.json();
  }

  async getMetric({ metricId }: { metricId: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("metrics", metricId),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getMetric", response);
    }

    return response.json();
  }

  async listEntities({
    entitySelector,
    fields,
    from,
    to,
    pageSize = 50,
    nextPageKey,
  }: {
    entitySelector: string;
    fields?: string;
    from?: string;
    to?: string;
    pageSize?: number;
    nextPageKey?: string;
  }): Promise<any> {
    const params = new URLSearchParams({ entitySelector });
    if (fields) params.set("fields", fields);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);

    const response = await fetch(
      this.makeUrl("entities") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listEntities", response);
    }

    return response.json();
  }

  async getEntity({
    entityId,
    fields,
    from,
    to,
  }: {
    entityId: string;
    fields?: string;
    from?: string;
    to?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const query = params.toString();
    const url = query
      ? this.makeUrl("entities", entityId) + "?" + query
      : this.makeUrl("entities", entityId);

    const response = await fetch(url, this.makeAuth());

    if (!response.ok) {
      throw await makeError("getEntity", response);
    }

    return response.json();
  }

  async listProblems({
    problemSelector,
    fields,
    from,
    to,
    pageSize = 50,
    nextPageKey,
  }: {
    problemSelector?: string;
    fields?: string;
    from?: string;
    to?: string;
    pageSize?: number;
    nextPageKey?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (problemSelector) params.set("problemSelector", problemSelector);
    if (fields) params.set("fields", fields);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);

    const response = await fetch(
      this.makeUrl("problems") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listProblems", response);
    }

    return response.json();
  }

  async getProblem({
    problemId,
    fields,
  }: {
    problemId: string;
    fields?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (fields) params.set("fields", fields);

    const query = params.toString();
    const url = query
      ? this.makeUrl("problems", problemId) + "?" + query
      : this.makeUrl("problems", problemId);

    const response = await fetch(url, this.makeAuth());

    if (!response.ok) {
      throw await makeError("getProblem", response);
    }

    return response.json();
  }

  async listEvents({
    eventSelector,
    from,
    to,
    pageSize = 50,
    nextPageKey,
  }: {
    eventSelector?: string;
    from?: string;
    to?: string;
    pageSize?: number;
    nextPageKey?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (eventSelector) params.set("eventSelector", eventSelector);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);

    const response = await fetch(
      this.makeUrl("events") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listEvents", response);
    }

    return response.json();
  }

  async getEvent({ eventId }: { eventId: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("events", eventId),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getEvent", response);
    }

    return response.json();
  }

  async listSlos({
    filter,
    from,
    to,
    pageSize = 50,
    nextPageKey,
    timeFrame,
  }: {
    filter?: string;
    from?: string;
    to?: string;
    pageSize?: number;
    nextPageKey?: string;
    timeFrame?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);
    if (timeFrame) params.set("timeFrame", timeFrame);

    const response = await fetch(
      this.makeUrl("slo") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listSlos", response);
    }

    return response.json();
  }

  async getSlo({
    id,
    from,
    to,
    timeFrame,
  }: {
    id: string;
    from?: string;
    to?: string;
    timeFrame?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (timeFrame) params.set("timeFrame", timeFrame);

    const query = params.toString();
    const url = query
      ? this.makeUrl("slo", id) + "?" + query
      : this.makeUrl("slo", id);

    const response = await fetch(url, this.makeAuth());

    if (!response.ok) {
      throw await makeError("getSlo", response);
    }

    return response.json();
  }

  async listEntityTypes({
    pageSize = 50,
    nextPageKey,
  }: {
    pageSize?: number;
    nextPageKey?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    params.set("pageSize", pageSize.toString());
    if (nextPageKey) params.set("nextPageKey", nextPageKey);

    const response = await fetch(
      this.makeUrl("entityTypes") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("listEntityTypes", response);
    }

    return response.json();
  }

  private makeUrl(...paths: string[]): string {
    return `${this.config.host}/api/v2/${paths.filter((p) => p).join("/")}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Api-Token ${this.config.apiToken}`,
        ...options.headers,
      },
    };
  }
}

type DynatraceClientConfig = {
  host: string;
  apiToken: string;
};
