import { tmpdir } from "node:os";
import { join } from "node:path";

import { EnvService } from "../../../core/service/env.service.ts";
import { makeError } from "../../../core/utils/http.utils.ts";

let instance: ReplicateService;

export const getReplicateService = (): ReplicateService => {
  if (!instance) instance = new ReplicateService();
  return instance;
};

export class ReplicateService {
  private readonly config: ReplicateClientConfig;

  constructor() {
    this.config = {
      apiToken: EnvService.getRequiredEnv(
        "REPLICATE_API_TOKEN",
        "Set it to your Replicate API token from https://replicate.com/account/api-tokens",
      ),
    };
  }

  async generateImage({
    prompt,
    imageInputs,
    aspectRatio,
    outputFormat,
  }: {
    prompt: string;
    imageInputs?: string[];
    aspectRatio?: AspectRatio;
    outputFormat?: OutputFormat;
  }): Promise<GenerateImageResult> {
    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: aspectRatio ?? "1:1",
      output_format: outputFormat ?? "jpg",
    };

    if (imageInputs && imageInputs.length > 0) {
      const dataUris = await Promise.all(
        imageInputs.map((filePath) => this.imageToDataUri(filePath)),
      );
      input.image_input = dataUris;
    }

    const response = await fetch(
      "https://api.replicate.com/v1/models/google/nano-banana/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({ input }),
      },
    );

    if (!response.ok) {
      throw await makeError("generateImage", response);
    }

    const prediction = (await response.json()) as ReplicatePrediction;

    if (prediction.status === "failed") {
      throw new Error(
        `Image generation failed: ${prediction.error ?? "Unknown error"}`,
      );
    }

    if (prediction.status !== "succeeded") {
      throw new Error(
        `Prediction did not complete in time. Status: ${prediction.status}. Try again or check https://replicate.com/p/${prediction.id}`,
      );
    }

    if (!prediction.output) {
      throw new Error("No output returned from prediction");
    }

    const outputUrl =
      typeof prediction.output === "string"
        ? prediction.output
        : prediction.output[0];

    const format = outputFormat ?? "jpg";
    const localPath = await this.downloadImage(outputUrl as string, format);

    return {
      filePath: localPath,
      prompt,
      model: "google/nano-banana",
      aspectRatio: aspectRatio ?? "1:1",
      outputFormat: format,
      predictionId: prediction.id,
    };
  }

  private async imageToDataUri(filePath: string): Promise<string> {
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      throw new Error(`Image file not found: ${filePath}`);
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  }

  private async downloadImage(url: string, format: string): Promise<string> {
    const filePath = join(
      tmpdir(),
      `replicate-${crypto.randomUUID()}.${format}`,
    );

    const curlPath = Bun.which("curl");

    if (curlPath) {
      // Use curl for downloading because Bun's fetch has connectivity issues
      // with replicate.delivery CDN domain
      const proc = Bun.spawn(["curl", "-sS", "-o", filePath, url], {
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await proc.exited;
      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(`Failed to download image: ${stderr}`);
      }
    } else {
      // Fallback to fetch when curl is not available
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to download image: HTTP ${response.status}. ` +
            `Consider installing curl for more reliable downloads.`,
        );
      }
      const buffer = await response.arrayBuffer();
      await Bun.write(filePath, buffer);
    }

    return filePath;
  }
}

type ReplicateClientConfig = {
  apiToken: string;
};

type AspectRatio =
  | "match_input_image"
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";

type OutputFormat = "jpg" | "png";

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
  metrics?: {
    predict_time?: number;
  };
};

type GenerateImageResult = {
  filePath: string;
  prompt: string;
  model: string;
  aspectRatio: AspectRatio;
  outputFormat: OutputFormat;
  predictionId: string;
};
