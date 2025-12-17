import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: GithubService;

export const getGithubService = (): GithubService => {
  if (!instance) instance = new GithubService();
  return instance;
};

export class GithubService {
  private readonly config: GithubClientConfig;

  constructor() {
    this.config = {
      host: EnvService.getRequiredEnv(
        "GITHUB_HOST",
        "Set to 'https://api.github.com' for GitHub.com, or your GitHub Enterprise URL (e.g. 'https://github.mycompany.com').",
      ).replace(/\/+$/, ""),
      apiToken: EnvService.getRequiredEnv(
        "GITHUB_API_TOKEN",
        "Set it to a GitHub Personal Access Token with repo scope.",
      ),
    };
  }

  async getPullRequest({
    owner,
    repo,
    pullNumber,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
  }): Promise<any> {
    const response = await fetch(
      this.makeUrl("repos", owner, repo, "pulls", pullNumber.toString()),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getPullRequest", response);
    }

    return response.json();
  }

  async getPullRequestComments({
    owner,
    repo,
    pullNumber,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
  }): Promise<any[]> {
    const response = await fetch(
      this.makeUrl(
        "repos",
        owner,
        repo,
        "pulls",
        pullNumber.toString(),
        "comments",
      ),
      this.makeAuth(),
    );

    if (!response.ok) {
      throw await makeError("getPullRequestComments", response);
    }

    return response.json() as Promise<any[]>;
  }

  async getPullRequestDiff({
    owner,
    repo,
    pullNumber,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
  }): Promise<string> {
    const response = await fetch(
      this.makeUrl("repos", owner, repo, "pulls", pullNumber.toString()),
      this.makeAuth({
        headers: {
          Accept: "application/vnd.github.diff",
        },
      }),
    );

    if (!response.ok) {
      throw await makeError("getPullRequestDiff", response);
    }

    return response.text();
  }

  async addPullRequestComment({
    owner,
    repo,
    pullNumber,
    body,
    commitId,
    path,
    line,
    side = "RIGHT",
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
    body: string;
    commitId: string;
    path: string;
    line: number;
    side?: "LEFT" | "RIGHT";
  }): Promise<any> {
    const response = await fetch(
      this.makeUrl(
        "repos",
        owner,
        repo,
        "pulls",
        pullNumber.toString(),
        "comments",
      ),
      this.makeAuth({
        method: "POST",
        body: JSON.stringify({
          body,
          commit_id: commitId,
          path,
          line,
          side,
        }),
      }),
    );

    if (!response.ok) {
      throw await makeError("addPullRequestComment", response);
    }

    return response.json();
  }

  async submitReview({
    owner,
    repo,
    pullNumber,
    event,
    body,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
    event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
    body?: string;
  }): Promise<any> {
    const payload: Record<string, string> = { event };
    if (body) {
      payload.body = body;
    }

    const response = await fetch(
      this.makeUrl(
        "repos",
        owner,
        repo,
        "pulls",
        pullNumber.toString(),
        "reviews",
      ),
      this.makeAuth({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );

    if (!response.ok) {
      throw await makeError("submitReview", response);
    }

    return response.json();
  }

  private makeUrl(...paths: string[]): string {
    const pathSegment = paths.filter((p) => p).join("/");

    if (this.config.host.includes("api.github.com")) {
      return `${this.config.host}/${pathSegment}`;
    }

    return `${this.config.host}/api/v3/${pathSegment}`;
  }

  private makeAuth(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.config.apiToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    };
  }
}

type GithubClientConfig = {
  host: string;
  apiToken: string;
};
