let instance: ModuleConfigService | null = null;

export const getModuleConfigService = (): ModuleConfigService => {
  if (!instance) instance = new ModuleConfigService();
  return instance;
};

export class ModuleConfigService {
  private readonly include: string[] | null = null;
  private readonly exclude: string[] | null = null;

  constructor() {
    const args = process.argv.slice(2);

    const includeIndex = args.indexOf("--include");
    const excludeIndex = args.indexOf("--exclude");

    // Check for env vars
    const envInclude = process.env.KLINK_INCLUDE;
    const envExclude = process.env.KLINK_EXCLUDE;

    // Determine what's available
    const hasCliInclude = includeIndex !== -1;
    const hasCliExclude = excludeIndex !== -1;
    const hasEnvInclude = !!envInclude;
    const hasEnvExclude = !!envExclude;

    // Validate mutual exclusivity for CLI args
    if (hasCliInclude && hasCliExclude) {
      throw new Error(
        "--include and --exclude are mutually exclusive. Use one or the other.",
      );
    }

    // Validate mutual exclusivity for env vars (only when no CLI args override)
    if (!hasCliInclude && !hasCliExclude && hasEnvInclude && hasEnvExclude) {
      throw new Error(
        "KLINK_INCLUDE and KLINK_EXCLUDE are mutually exclusive. Use one or the other.",
      );
    }

    // Apply CLI args first (they take precedence)
    if (hasCliInclude) {
      if (!args[includeIndex + 1]) {
        throw new Error("--include requires a comma-separated list of modules");
      }
      this.include = this.parseModuleList(args[includeIndex + 1] as string);
    } else if (hasCliExclude) {
      if (!args[excludeIndex + 1]) {
        throw new Error("--exclude requires a comma-separated list of modules");
      }
      this.exclude = this.parseModuleList(args[excludeIndex + 1] as string);
    }
    // Fall back to env vars if no CLI args
    else if (hasEnvInclude) {
      this.include = this.parseModuleList(envInclude);
    } else if (hasEnvExclude) {
      this.exclude = this.parseModuleList(envExclude);
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
