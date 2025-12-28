import ora from 'ora';
import { CompletionFactory } from '../core/completions/factory.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';
import { detectShell, SupportedShell } from '../utils/shell-detection.js';
import { CompletionProvider } from '../core/completions/completion-provider.js';
import { getArchivedChangeIds } from '../utils/item-discovery.js';

interface GenerateOptions {
  shell?: string;
}

interface InstallOptions {
  shell?: string;
  verbose?: boolean;
}

interface UninstallOptions {
  shell?: string;
  yes?: boolean;
}

interface CompleteOptions {
  type: string;
}

/**
 * Command for managing shell completions for OpenSpec CLI
 */
export class CompletionCommand {
  private completionProvider: CompletionProvider;

  constructor() {
    this.completionProvider = new CompletionProvider();
  }
  /**
   * Resolve shell parameter or exit with error
   *
   * @param shell - The shell parameter (may be undefined)
   * @param operationName - Name of the operation (for error messages)
   * @returns Resolved shell or null if should exit
   */
  private resolveShellOrExit(shell: string | undefined, operationName: string): SupportedShell | null {
    const normalizedShell = this.normalizeShell(shell);

    if (!normalizedShell) {
      const detectionResult = detectShell();

      if (detectionResult.shell && CompletionFactory.isSupported(detectionResult.shell)) {
        return detectionResult.shell;
      }

      // Shell was detected but not supported
      if (detectionResult.detected && !detectionResult.shell) {
        console.error(`錯誤：Shell「${detectionResult.detected}」尚未支援。目前支援：${CompletionFactory.getSupportedShells().join(', ')}`);
        process.exitCode = 1;
        return null;
      }

      // No shell specified and cannot auto-detect
      console.error('錯誤：無法自動偵測 shell。請明確指定 shell。');
      console.error(`用法：openspec-tw completion ${operationName} [shell]`);
      console.error(`目前支援：${CompletionFactory.getSupportedShells().join(', ')}`);
      process.exitCode = 1;
      return null;
    }

    if (!CompletionFactory.isSupported(normalizedShell)) {
      console.error(`錯誤：Shell「${normalizedShell}」尚未支援。目前支援：${CompletionFactory.getSupportedShells().join(', ')}`);
      process.exitCode = 1;
      return null;
    }

    return normalizedShell;
  }

  /**
   * Generate completion script and output to stdout
   *
   * @param options - Options for generation (shell type)
   */
  async generate(options: GenerateOptions = {}): Promise<void> {
    const shell = this.resolveShellOrExit(options.shell, 'generate');
    if (!shell) return;

    await this.generateForShell(shell);
  }

  /**
   * Install completion script to the appropriate location
   *
   * @param options - Options for installation (shell type, verbose output)
   */
  async install(options: InstallOptions = {}): Promise<void> {
    const shell = this.resolveShellOrExit(options.shell, 'install');
    if (!shell) return;

    await this.installForShell(shell, options.verbose || false);
  }

  /**
   * Uninstall completion script from the installation location
   *
   * @param options - Options for uninstallation (shell type, yes flag)
   */
  async uninstall(options: UninstallOptions = {}): Promise<void> {
    const shell = this.resolveShellOrExit(options.shell, 'uninstall');
    if (!shell) return;

    await this.uninstallForShell(shell, options.yes || false);
  }

  /**
   * Generate completion script for a specific shell
   */
  private async generateForShell(shell: SupportedShell): Promise<void> {
    const generator = CompletionFactory.createGenerator(shell);
    const script = generator.generate(COMMAND_REGISTRY);
    console.log(script);
  }

  /**
   * Install completion script for a specific shell
   */
  private async installForShell(shell: SupportedShell, verbose: boolean): Promise<void> {
    const generator = CompletionFactory.createGenerator(shell);
    const installer = CompletionFactory.createInstaller(shell);

    const spinner = ora(`正在安裝 ${shell} 補全腳本...`).start();

    try {
      // Generate the completion script
      const script = generator.generate(COMMAND_REGISTRY);

      // Install it
      const result = await installer.install(script);

      spinner.stop();

      if (result.success) {
        console.log(`✓ ${result.message}`);

        if (verbose && result.installedPath) {
          console.log(`  安裝至：${result.installedPath}`);
          if (result.backupPath) {
            console.log(`  已建立備份：${result.backupPath}`);
          }
          if (result.zshrcConfigured) {
            console.log(`  ~/.zshrc 已自動配置`);
          }
        }

        // Print instructions (only shown if .zshrc wasn't auto-configured)
        if (result.instructions && result.instructions.length > 0) {
          console.log('');
          for (const instruction of result.instructions) {
            console.log(instruction);
          }
        } else if (result.zshrcConfigured) {
          console.log('');
          console.log('重新啟動您的 shell 或執行：exec zsh');
        }
      } else {
        console.error(`✗ ${result.message}`);
        process.exitCode = 1;
      }
    } catch (error) {
      spinner.stop();
      console.error(`✗ 安裝補全腳本失敗：${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }

  /**
   * Uninstall completion script for a specific shell
   */
  private async uninstallForShell(shell: SupportedShell, skipConfirmation: boolean): Promise<void> {
    const installer = CompletionFactory.createInstaller(shell);

    // Prompt for confirmation unless --yes flag is provided
    if (!skipConfirmation) {
      const { confirm } = await import('@inquirer/prompts');
      const confirmed = await confirm({
        message: '從 ~/.zshrc 移除 OpenSpec 配置？',
        default: false,
      });

      if (!confirmed) {
        console.log('解除安裝已取消。');
        return;
      }
    }

    const spinner = ora(`正在解除安裝 ${shell} 補全腳本...`).start();

    try {
      const result = await installer.uninstall();

      spinner.stop();

      if (result.success) {
        console.log(`✓ ${result.message}`);
      } else {
        console.error(`✗ ${result.message}`);
        process.exitCode = 1;
      }
    } catch (error) {
      spinner.stop();
      console.error(`✗ 解除安裝補全腳本失敗：${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }

  /**
   * Output machine-readable completion data for shell consumption
   * Format: tab-separated "id\tdescription" per line
   *
   * @param options - Options specifying completion type
   */
  async complete(options: CompleteOptions): Promise<void> {
    const type = options.type.toLowerCase();

    try {
      switch (type) {
        case 'changes': {
          const changeIds = await this.completionProvider.getChangeIds();
          for (const id of changeIds) {
            console.log(`${id}\tactive change`);
          }
          break;
        }
        case 'specs': {
          const specIds = await this.completionProvider.getSpecIds();
          for (const id of specIds) {
            console.log(`${id}\tspecification`);
          }
          break;
        }
        case 'archived-changes': {
          const archivedIds = await getArchivedChangeIds();
          for (const id of archivedIds) {
            console.log(`${id}\tarchived change`);
          }
          break;
        }
        default:
          // Invalid type - silently exit with no output for graceful shell completion failure
          process.exitCode = 1;
          break;
      }
    } catch {
      // Silently fail for graceful shell completion experience
      process.exitCode = 1;
    }
  }

  /**
   * Normalize shell parameter to lowercase
   */
  private normalizeShell(shell?: string): string | undefined {
    return shell?.toLowerCase();
  }
}
