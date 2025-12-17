import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: JiraService;

export const getJiraService = (): JiraService => {
  if (!instance) instance = new JiraService();
  return instance;
};

export class JiraService {
  private readonly config: JiraClientConfig;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "JIRA_HOST",
        "Set it to your Jira base URL, e.g. 'https://your-org.atlassian.net'.",
      ).replace(/\/+$/, ""),
      emailAddress: EnvService.getRequiredEnv(
        "JIRA_EMAIL_ADDRESS",
        "Set it to the Jira user email address, e.g. 'you@company.com'.",
      ),
      apiToken: EnvService.getRequiredEnv(
        "JIRA_API_TOKEN",
        "Set it to an Atlassian API token.",
      ),
    };
  }

  async getIssue({
    issueIdOrKey,
    fields = "*all",
    expand = "renderedFields,names",
  }: {
    issueIdOrKey: string;
    fields?: string;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      fields,
      expand,
    });

    const response = await fetch(
      this.makeUrl("issue", issueIdOrKey) + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getIssue", response);
    }

    return response.json();
  }

  async searchIssues({
    jql,
    startAt = 0,
    maxResults = 50,
    fields = "summary,issuetype,status,priority,assignee,reporter,created,updated,project",
    expand = "renderedFields,names",
  }: {
    jql: string;
    startAt?: number;
    maxResults?: number;
    fields?: string;
    expand?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      jql,
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
      fields,
      expand,
    });

    const response = await fetch(
      this.makeUrl("search", "jql") + "?" + params.toString(),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("searchIssues", response);
    }

    return response.json();
  }

  private makeUrl(...paths: string[]): string {
    return `${this.config.host}/rest/api/3/${paths.filter((p) => p).join("/")}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    const asString = `${this.config.emailAddress.trim()}:${this.config.apiToken.trim()}`;
    const asBase64 = Buffer.from(asString, "utf-8").toString("base64");

    return {
      ...options,
      headers: {
        ...options.headers,
        Accept: "application/json",
        Authorization: `Basic ${asBase64}`,
        "Content-Type": "application/json",
      },
    };
  }
}

type JiraClientConfig = {
  host: string;
  emailAddress: string;
  apiToken: string;
};
