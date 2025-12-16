export class EnvService {
  static getRequiredEnv(key: string, instruction: string): string {
    const value = process.env[key];
    if (value === undefined || value.trim() === "") {
      throw new Error(
        `Missing required environment variable ${key}. ${instruction}`,
      );
    }

    return value.trim();
  }
}
