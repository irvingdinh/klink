import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: N8nService;

export const getN8nService = (): N8nService => {
  if (!instance) instance = new N8nService();
  return instance;
};

export class N8nService {
  private readonly config: N8nClientConfig;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "N8N_HOST",
        "Set it to your n8n instance URL (e.g., 'https://n8n.example.com').",
      ).replace(/\/+$/, ""),
      apiKey: EnvService.getRequiredEnv(
        "N8N_API_KEY",
        "Set it to your n8n API key. Generate one in n8n Settings > API.",
      ),
    };
  }

  async listWorkflows({
    active,
    tags,
    limit,
    cursor,
  }: {
    active?: boolean;
    tags?: string;
    limit?: number;
    cursor?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (active !== undefined) params.set("active", String(active));
    if (tags) params.set("tags", tags);
    if (limit !== undefined) params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);

    const query = params.toString();
    const url = this.makeUrl("workflows") + (query ? `?${query}` : "");

    const response = await fetch(url, this.makeAuth());

    if (!response.ok) {
      throw await makeError("listWorkflows", response);
    }

    return response.json();
  }

  async getWorkflow({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("workflows", id),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getWorkflow", response);
    }

    return response.json();
  }

  async createWorkflow({
    name,
    nodes,
    connections,
    settings,
    staticData,
  }: {
    name: string;
    nodes?: any[];
    connections?: Record<string, any>;
    settings?: Record<string, any>;
    staticData?: Record<string, any>;
  }): Promise<any> {
    const payload: Record<string, any> = { name };
    if (nodes) payload.nodes = nodes;
    if (connections) payload.connections = connections;
    if (settings) payload.settings = settings;
    if (staticData) payload.staticData = staticData;

    const response = await fetch(
      this.makeUrl("workflows"),
      this.makeAuth({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );

    if (!response.ok) {
      throw await makeError("createWorkflow", response);
    }

    return response.json();
  }

  async updateWorkflow({
    id,
    name,
    nodes,
    connections,
    settings,
    staticData,
  }: {
    id: string;
    name?: string;
    nodes?: any[];
    connections?: Record<string, any>;
    settings?: Record<string, any>;
    staticData?: Record<string, any>;
  }): Promise<any> {
    const payload: Record<string, any> = {};
    if (name !== undefined) payload.name = name;
    if (nodes !== undefined) payload.nodes = nodes;
    if (connections !== undefined) payload.connections = connections;
    if (settings !== undefined) payload.settings = settings;
    if (staticData !== undefined) payload.staticData = staticData;

    const response = await fetch(
      this.makeUrl("workflows", id),
      this.makeAuth({
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    );

    if (!response.ok) {
      throw await makeError("updateWorkflow", response);
    }

    return response.json();
  }

  async deleteWorkflow({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("workflows", id),
      this.makeAuth({ method: "DELETE" }),
    );

    if (!response.ok) {
      throw await makeError("deleteWorkflow", response);
    }

    return response.json();
  }

  async activateWorkflow({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("workflows", id, "activate"),
      this.makeAuth({ method: "POST" }),
    );

    if (!response.ok) {
      throw await makeError("activateWorkflow", response);
    }

    return response.json();
  }

  async deactivateWorkflow({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("workflows", id, "deactivate"),
      this.makeAuth({ method: "POST" }),
    );

    if (!response.ok) {
      throw await makeError("deactivateWorkflow", response);
    }

    return response.json();
  }

  async listExecutions({
    workflowId,
    status,
    limit,
    cursor,
  }: {
    workflowId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (workflowId) params.set("workflowId", workflowId);
    if (status) params.set("status", status);
    if (limit !== undefined) params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);

    const query = params.toString();
    const url = this.makeUrl("executions") + (query ? `?${query}` : "");

    const response = await fetch(url, this.makeAuth());

    if (!response.ok) {
      throw await makeError("listExecutions", response);
    }

    return response.json();
  }

  async getExecution({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("executions", id),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getExecution", response);
    }

    return response.json();
  }

  async deleteExecution({ id }: { id: string }): Promise<any> {
    const response = await fetch(
      this.makeUrl("executions", id),
      this.makeAuth({ method: "DELETE" }),
    );

    if (!response.ok) {
      throw await makeError("deleteExecution", response);
    }

    return response.json();
  }

  async listTags(): Promise<any> {
    const response = await fetch(this.makeUrl("tags"), this.makeAuth());

    if (!response.ok) {
      throw await makeError("listTags", response);
    }

    return response.json();
  }

  private makeUrl(...paths: string[]): string {
    const pathSegment = paths.filter((p) => p).join("/");
    return `${this.config.host}/api/v1/${pathSegment}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-N8N-API-KEY": this.config.apiKey,
        ...options.headers,
      },
    };
  }
}

type N8nClientConfig = {
  host: string;
  apiKey: string;
};
