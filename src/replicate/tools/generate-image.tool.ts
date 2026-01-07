import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  withErrorHandling,
  withTextOutput,
} from "../../core/utils/tool.utils.ts";
import { getReplicateService } from "../services/external/replicate.service.ts";

const inputSchema = {
  prompt: z
    .string()
    .describe(
      "Text description of the image to generate. Be specific and detailed for best results. " +
        "Example: 'A serene mountain landscape at sunset with snow-capped peaks'",
    ),
  imageInputs: z
    .array(z.string())
    .optional()
    .describe(
      "Optional array of local file paths to reference images for editing or multi-image fusion. " +
        "Use this to transform existing images or combine multiple images. " +
        "Example: ['/path/to/image1.jpg', '/path/to/image2.png']",
    ),
  aspectRatio: z
    .enum([
      "match_input_image",
      "1:1",
      "2:3",
      "3:2",
      "3:4",
      "4:3",
      "4:5",
      "5:4",
      "9:16",
      "16:9",
      "21:9",
    ])
    .optional()
    .default("1:1")
    .describe(
      "Aspect ratio for the output image. Use 'match_input_image' when editing to keep the original ratio. " +
        "Common ratios: '1:1' (square), '16:9' (landscape/video), '9:16' (portrait/mobile), '4:3' (photo).",
    ),
  outputFormat: z
    .enum(["jpg", "png"])
    .optional()
    .default("jpg")
    .describe(
      "Output image format. Use 'jpg' for smaller file sizes, 'png' for transparency support.",
    ),
};

export const registerGenerateImageTool = (server: McpServer) => {
  server.registerTool(
    "replicate_generate_image",
    {
      description:
        "Generate or edit images using Google's nano-banana model on Replicate. " +
        "Supports text-to-image generation and image editing with reference images. " +
        "For text-to-image: provide only a prompt. " +
        "For image editing: provide a prompt describing the changes and imageInputs with the source image(s). " +
        "Returns the local file path where the generated image is saved.",
      inputSchema,
    },
    withErrorHandling(
      withTextOutput(
        async ({ prompt, imageInputs, aspectRatio, outputFormat }) => {
          const replicateService = getReplicateService();
          const result = await replicateService.generateImage({
            prompt,
            imageInputs,
            aspectRatio,
            outputFormat,
          });

          return JSON.stringify(result, null, 2);
        },
      ),
    ),
  );
};
