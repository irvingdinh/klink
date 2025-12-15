let instance: JiraService;

export const getJiraService = (): JiraService => {
  if (!instance) instance = new JiraService();
  return instance;
};

export class JiraService {
  private readonly config: JiraClientConfig;

  constructor() {
    this.config = {
      host: process.env.JIRA_HOST as string,
      emailAddress: process.env.JIRA_EMAIL_ADDRESS as string,
      apiToken: process.env.JIRA_API_TOKEN as string,
    };
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
