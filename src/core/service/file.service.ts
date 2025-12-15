import { tmpdir } from "os";
import { join } from "path";

export class FileService {
  static async writeTemporaryTextOutput(
    moduleRef: string,
    toolRef: string,
    payload: string,
  ): Promise<string> {
    const fileName = `${moduleRef}-${toolRef}-${crypto.randomUUID()}.txt`;
    const filePath = join(tmpdir(), fileName);
    await Bun.write(filePath, payload);
    return filePath;
  }
}
