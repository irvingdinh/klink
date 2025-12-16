let instance: JiraService;

export const getJiraService = (): JiraService => {
  if (!instance) instance = new JiraService();
  return instance;
};

export class JiraService {
  private readonly config: JiraClientConfig;

  constructor() {
    const host = getRequiredEnv(
      "JIRA_HOST",
      "Set it to your Jira base URL, e.g. 'https://your-org.atlassian.net'.",
    ).replace(/\/+$/, "");

    this.config = {
      host,
      emailAddress: getRequiredEnv(
        "JIRA_EMAIL_ADDRESS",
        "Set it to the Jira user email address, e.g. 'you@company.com'.",
      ),
      apiToken: getRequiredEnv(
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
      const text = await response.text();
      throw new Error(
        `Failed to get issue: ${response.status} ${response.statusText} - ${text}`,
      );
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
      const text = await response.text();
      throw new Error(
        `Failed to search issues: ${response.status} ${response.statusText} - ${text}`,
      );
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

const getRequiredEnv = (key: string, guidance: string): string => {
  const value = process.env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable ${key}. ${guidance}`);
  }

  return value.trim();
};
