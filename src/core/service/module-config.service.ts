let instance: ModuleConfigService | null = null;

export const getModuleConfigService = (): ModuleConfigService => {
  if (!instance) instance = new ModuleConfigService();
  return instance;
};

export class ModuleConfigService {
  private readonly include: string[] | null = null;
  private readonly exclude: string[] | null = null;

  constructor() {
    const envInclude = process.env.KLINKLANG_INCLUDE?.trim() || null;
    const envExclude = process.env.KLINKLANG_EXCLUDE?.trim() || null;

    if (envInclude && envExclude) {
      throw new Error(
        "KLINKLANG_INCLUDE and KLINKLANG_EXCLUDE are mutually exclusive. Use one or the other.",
      );
    }

    if (envInclude) {
      this.include = this.parseModuleList(envInclude);
      return;
    }

    if (envExclude) {
      this.exclude = this.parseModuleList(envExclude);
      return;
    }

    const args = process.argv.slice(2);

    const includeIndex = args.indexOf("--include");
    const excludeIndex = args.indexOf("--exclude");

    if (includeIndex !== -1 && excludeIndex !== -1) {
      throw new Error(
        "--include and --exclude are mutually exclusive. Use one or the other.",
      );
    }

    if (includeIndex !== -1) {
      if (!args[includeIndex + 1]) {
        throw new Error("--include requires a comma-separated list of modules");
      }
      this.include = this.parseModuleList(args[includeIndex + 1] as string);
    }

    if (excludeIndex !== -1) {
      if (!args[excludeIndex + 1]) {
        throw new Error("--exclude requires a comma-separated list of modules");
      }
      this.exclude = this.parseModuleList(args[excludeIndex + 1] as string);
    }
  }

  isEnabled(module: string): boolean {
    // TODO: Add validation for unknown module names in the future
    if (this.include !== null) {
      return this.include.includes(module);
    }

    if (this.exclude !== null) {
      return !this.exclude.includes(module);
    }

    return true;
  }

  private parseModuleList(value: string): string[] {
    return value
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter((m) => m.length > 0);
  }
}
