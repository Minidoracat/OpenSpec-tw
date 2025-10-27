import { Command } from 'commander';
import { createRequire } from 'module';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { InitCommand } from '../core/init.js';
import { AI_TOOLS } from '../core/config.js';
import { UpdateCommand } from '../core/update.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { ViewCommand } from '../core/view.js';
import { registerSpecCommand } from '../commands/spec.js';
import { ChangeCommand } from '../commands/change.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('openspec-tw')
  .description('繁體中文 AI 原生的規範驅動開發系統')
  .version(version);

// Global options
program.option('--no-color', '停用彩色輸出');

// Apply global flags before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.noColor) {
    process.env.NO_COLOR = '1';
  }
});

const availableToolIds = AI_TOOLS.filter((tool) => tool.available).map((tool) => tool.value);
const toolsOptionDescription = `非互動式配置 AI 工具。使用 "all"、"none" 或逗號分隔的工具清單:${availableToolIds.join(', ')}`;

program
  .command('init [path]')
  .description('在專案中初始化 OpenSpec')
  .option('--tools <tools>', toolsOptionDescription)
  .action(async (targetPath = '.', options?: { tools?: string }) => {
    try {
      // Validate that the path is a valid directory
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(`路徑 "${targetPath}" 不是目錄`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, but we can create it
          console.log(`目錄 "${targetPath}" 不存在,將會建立它。`);
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`無法存取路徑 "${targetPath}": ${error.message}`);
        }
      }
      
      const initCommand = new InitCommand({
        tools: options?.tools,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('更新 OpenSpec 指令檔案')
  .action(async (targetPath = '.') => {
    try {
      const resolvedPath = path.resolve(targetPath);
      const updateCommand = new UpdateCommand();
      await updateCommand.execute(resolvedPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('列出項目(預設為變更)。使用 --specs 列出規範。')
  .option('--specs', '列出規範而非變更')
  .option('--changes', '明確列出變更(預設)')
  .action(async (options?: { specs?: boolean; changes?: boolean }) => {
    try {
      const listCommand = new ListCommand();
      const mode: 'changes' | 'specs' = options?.specs ? 'specs' : 'changes';
      await listCommand.execute('.', mode);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('view')
  .description('顯示規範和變更的互動式儀表板')
  .action(async () => {
    try {
      const viewCommand = new ViewCommand();
      await viewCommand.execute('.');
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Change command with subcommands
const changeCmd = program
  .command('change')
  .description('管理 OpenSpec 變更提案');

// Deprecation notice for noun-based commands
changeCmd.hook('preAction', () => {
  console.error('警告:"openspec-tw change ..." 命令已棄用。建議使用動詞優先的命令(例如 "openspec-tw list"、"openspec-tw validate --changes")。');
});

changeCmd
  .command('show [change-name]')
  .description('以 JSON 或 Markdown 格式顯示變更提案')
  .option('--json', '輸出為 JSON')
  .option('--deltas-only', '僅顯示差異(僅限 JSON)')
  .option('--requirements-only', '--deltas-only 的別名(已棄用)')
  .option('--no-interactive', '停用互動式提示')
  .action(async (changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.show(changeName, options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('list')
  .description('列出所有活動變更(已棄用:請使用 "openspec-tw list")')
  .option('--json', '輸出為 JSON')
  .option('--long', '顯示 ID 和標題及計數')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      console.error('警告:"openspec-tw change list" 已棄用。請使用 "openspec-tw list"。');
      const changeCommand = new ChangeCommand();
      await changeCommand.list(options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('validate [change-name]')
  .description('驗證變更提案')
  .option('--strict', '啟用嚴格驗證模式')
  .option('--json', '輸出驗證報告為 JSON')
  .option('--no-interactive', '停用互動式提示')
  .action(async (changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.validate(changeName, options);
      if (typeof process.exitCode === 'number' && process.exitCode !== 0) {
        process.exit(process.exitCode);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('archive [change-name]')
  .description('封存已完成的變更並更新主要規範')
  .option('-y, --yes', '跳過確認提示')
  .option('--skip-specs', '跳過規範更新操作(適用於基礎設施、工具或僅文件變更)')
  .option('--no-validate', '跳過驗證(不建議,需要確認)')
  .action(async (changeName?: string, options?: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean }) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

registerSpecCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('驗證變更和規範')
  .option('--all', '驗證所有變更和規範')
  .option('--changes', '驗證所有變更')
  .option('--specs', '驗證所有規範')
  .option('--type <type>', '指定項目類型(當不明確時):change|spec')
  .option('--strict', '啟用嚴格驗證模式')
  .option('--json', '輸出驗證結果為 JSON')
  .option('--concurrency <n>', '最大並發驗證數(預設為環境變數 OPENSPEC_CONCURRENCY 或 6)')
  .option('--no-interactive', '停用互動式提示')
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean; concurrency?: string }) => {
    try {
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Top-level show command
program
  .command('show [item-name]')
  .description('顯示變更或規範')
  .option('--json', '輸出為 JSON')
  .option('--type <type>', '指定項目類型(當不明確時):change|spec')
  .option('--no-interactive', '停用互動式提示')
  // change-only flags
  .option('--deltas-only', '僅顯示差異(僅限 JSON,變更)')
  .option('--requirements-only', '--deltas-only 的別名(已棄用,變更)')
  // spec-only flags
  .option('--requirements', '僅限 JSON:僅顯示需求(排除情境)')
  .option('--no-scenarios', '僅限 JSON:排除情境內容')
  .option('-r, --requirement <id>', '僅限 JSON:按 ID 顯示特定需求(從 1 開始)')
  // allow unknown options to pass-through to underlying command implementation
  .allowUnknownOption(true)
  .action(async (itemName?: string, options?: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any }) => {
    try {
      const showCommand = new ShowCommand();
      await showCommand.execute(itemName, options ?? {});
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
