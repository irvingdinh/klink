import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: PocketBaseService;

export const getPocketBaseService = (): PocketBaseService => {
  if (!instance) instance = new PocketBaseService();
  return instance;
};

export class PocketBaseService {
  private readonly config: PocketBaseClientConfig;
  private authToken: string | null = null;
  private authTokenExpiry: number = 0;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "POCKETBASE_HOST",
        "Set it to your Pocketbase base URL, e.g. 'https://pb.example.com'.",
      ).replace(/\/+$/, ""),
      adminEmail: EnvService.getRequiredEnv(
        "POCKETBASE_ADMIN_EMAIL",
        "Set it to the Pocketbase admin email address.",
      ),
      adminPassword: EnvService.getRequiredEnv(
        "POCKETBASE_ADMIN_PASSWORD",
        "Set it to the Pocketbase admin password.",
      ),
    };
  }

  async listCollections(): Promise<PocketBaseCollection[]> {
    return this.request<PocketBaseCollection[]>("GET", "/api/collections");
  }

  async getCollection({ id }: { id: string }): Promise<PocketBaseCollection> {
    return this.request<PocketBaseCollection>(
      "GET",
      `/api/collections/${encodeURIComponent(id)}`,
    );
  }

  async createCollection({
    data,
  }: {
    data: unknown;
  }): Promise<PocketBaseCollection> {
    return this.request<PocketBaseCollection>("POST", "/api/collections", {
      body: data,
    });
  }

  async updateCollection({
    id,
    data,
  }: {
    id: string;
    data: unknown;
  }): Promise<PocketBaseCollection> {
    return this.request<PocketBaseCollection>(
      "PATCH",
      `/api/collections/${encodeURIComponent(id)}`,
      {
        body: data,
      },
    );
  }

  async deleteCollection({ id }: { id: string }): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/api/collections/${encodeURIComponent(id)}`,
    );
  }

  async truncateCollection({ id }: { id: string }): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/api/collections/${encodeURIComponent(id)}/truncate`,
    );
  }

  async listRecords({
    collection,
    filter,
    sort,
    expand,
    fields,
    page = 1,
    perPage = 30,
  }: {
    collection: string;
    filter?: string;
    sort?: string;
    expand?: string;
    fields?: string;
    page?: number;
    perPage?: number;
  }): Promise<PocketBaseList<PocketBaseRecord>> {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("perPage", perPage.toString());
    if (filter) params.set("filter", filter);
    if (sort) params.set("sort", sort);
    if (expand) params.set("expand", expand);
    if (fields) params.set("fields", fields);

    return this.request<PocketBaseList<PocketBaseRecord>>(
      "GET",
      `/api/collections/${encodeURIComponent(collection)}/records`,
      { params },
    );
  }

  async getRecord({
    collection,
    id,
    expand,
    fields,
  }: {
    collection: string;
    id: string;
    expand?: string;
    fields?: string;
  }): Promise<PocketBaseRecord> {
    const params = new URLSearchParams();
    if (expand) params.set("expand", expand);
    if (fields) params.set("fields", fields);

    return this.request<PocketBaseRecord>(
      "GET",
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`,
      { params: params.size > 0 ? params : undefined },
    );
  }

  async createRecord({
    collection,
    data,
  }: {
    collection: string;
    data: unknown;
  }): Promise<PocketBaseRecord> {
    return this.request<PocketBaseRecord>(
      "POST",
      `/api/collections/${encodeURIComponent(collection)}/records`,
      { body: data },
    );
  }

  async updateRecord({
    collection,
    id,
    data,
  }: {
    collection: string;
    id: string;
    data: unknown;
  }): Promise<PocketBaseRecord> {
    return this.request<PocketBaseRecord>(
      "PATCH",
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`,
      { body: data },
    );
  }

  async deleteRecord({
    collection,
    id,
  }: {
    collection: string;
    id: string;
  }): Promise<void> {
    await this.request<void>(
      "DELETE",
      `/api/collections/${encodeURIComponent(collection)}/records/${encodeURIComponent(id)}`,
    );
  }

  async getSettings(): Promise<unknown> {
    return this.request<unknown>("GET", "/api/settings");
  }

  async updateSettings({ data }: { data: unknown }): Promise<unknown> {
    return this.request<unknown>("PATCH", "/api/settings", { body: data });
  }

  async testS3({ filesystem }: { filesystem: string }): Promise<unknown> {
    return this.request<unknown>("POST", "/api/settings/test/s3", {
      body: { filesystem },
    });
  }

  async testEmail({
    email,
    template,
  }: {
    email: string;
    template: string;
  }): Promise<unknown> {
    return this.request<unknown>("POST", "/api/settings/test/email", {
      body: { email, template },
    });
  }

  async listLogs({
    filter,
    page = 1,
    perPage = 30,
  }: {
    filter?: string;
    page?: number;
    perPage?: number;
  }): Promise<PocketBaseList<PocketBaseLog>> {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("perPage", perPage.toString());
    if (filter) params.set("filter", filter);

    return this.request<PocketBaseList<PocketBaseLog>>("GET", "/api/logs", {
      params,
    });
  }

  async getLog({ id }: { id: string }): Promise<PocketBaseLog> {
    return this.request<PocketBaseLog>(
      "GET",
      `/api/logs/${encodeURIComponent(id)}`,
    );
  }

  async getLogStats({
    filter,
  }: {
    filter?: string;
  }): Promise<PocketBaseLogStats> {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);

    return this.request<PocketBaseLogStats>("GET", "/api/logs/stats", {
      params: params.size > 0 ? params : undefined,
    });
  }

  getFileUrl({
    collection,
    recordId,
    filename,
    thumb,
    token,
  }: {
    collection: string;
    recordId: string;
    filename: string;
    thumb?: string;
    token?: string;
  }): string {
    const url = new URL(
      `${this.config.host}/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(recordId)}/${encodeURIComponent(filename)}`,
    );
    if (thumb) url.searchParams.set("thumb", thumb);
    if (token) url.searchParams.set("token", token);
    return url.toString();
  }

  async generateFileToken(): Promise<string> {
    await this.ensureAuthenticated();

    const response = await fetch(`${this.config.host}/api/files/token`, {
      method: "POST",
      headers: {
        Authorization: this.authToken!,
      },
    });

    if (!response.ok) {
      throw await makeError("generateFileToken", response);
    }

    const data = (await response.json()) as { token: string };
    return data.token;
  }

  async impersonateUser({
    collection,
    id,
    duration,
  }: {
    collection: string;
    id: string;
    duration?: number;
  }): Promise<PocketBaseImpersonateResponse> {
    return this.request<PocketBaseImpersonateResponse>(
      "POST",
      `/api/collections/${encodeURIComponent(collection)}/impersonate/${encodeURIComponent(id)}`,
      { body: duration ? { duration } : undefined },
    );
  }

  private async ensureAuthenticated(): Promise<void> {
    const now = Date.now();
    if (this.authToken && this.authTokenExpiry > now + 5 * 60 * 1000) {
      return;
    }

    const response = await fetch(
      `${this.config.host}/api/collections/_superusers/auth-with-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: this.config.adminEmail,
          password: this.config.adminPassword,
        }),
      },
    );

    if (!response.ok) {
      throw await makeError("adminAuth", response);
    }

    const data = (await response.json()) as { token: string };
    this.authToken = data.token;

    try {
      const parts = data.token.split(".");
      if (parts[1]) {
        const payload = JSON.parse(atob(parts[1]));
        this.authTokenExpiry = payload.exp * 1000;
      } else {
        this.authTokenExpiry = now + 60 * 60 * 1000;
      }
    } catch {
      this.authTokenExpiry = now + 60 * 60 * 1000; // 1-hour fallback
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options: { params?: URLSearchParams; body?: unknown } = {},
  ): Promise<T> {
    await this.ensureAuthenticated();

    const url = new URL(`${this.config.host}${path}`);
    if (options.params) {
      url.search = options.params.toString();
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: this.authToken!,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw await makeError(path, response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }
}

type PocketBaseClientConfig = {
  host: string;
  adminEmail: string;
  adminPassword: string;
};

type PocketBaseList<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

type PocketBaseCollection = {
  id: string;
  name: string;
  type: "base" | "auth" | "view";
  system: boolean;
  fields: PocketBaseField[];
  indexes: string[];
  created: string;
  updated: string;
};

type PocketBaseField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  system: boolean;
  [key: string]: unknown;
};

type PocketBaseRecord<T = Record<string, unknown>> = {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
} & T;

type PocketBaseLog = {
  id: string;
  level: number;
  message: string;
  data: Record<string, unknown>;
  created: string;
};

type PocketBaseLogStats = {
  total: number;
  data: Array<{ date: string; total: number }>;
};

type PocketBaseImpersonateResponse = {
  token: string;
  record: PocketBaseRecord;
};
