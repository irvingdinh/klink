import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export class FileService {
  static async writeTemporaryTextOutput(
    moduleRef: string,
    toolRef: string,
    payload: string,
  ): Promise<string> {
    const fileName = `${moduleRef}-${toolRef}-${crypto.randomUUID()}.txt`;
    const filePath = join(tmpdir(), fileName);
    await writeFile(filePath, payload);
    return filePath;
  }
}
