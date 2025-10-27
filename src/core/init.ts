import path from 'path';
import {
  createPrompt,
  isBackspaceKey,
  isDownKey,
  isEnterKey,
  isSpaceKey,
  isUpKey,
  useKeypress,
  usePagination,
  useState,
} from '@inquirer/core';
import chalk from 'chalk';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { TemplateManager, ProjectContext } from './templates/index.js';
import { ToolRegistry } from './configurators/registry.js';
import { SlashCommandRegistry } from './configurators/slash/registry.js';
import {
  OpenSpecConfig,
  AI_TOOLS,
  OPENSPEC_DIR_NAME,
  AIToolOption,
  OPENSPEC_MARKERS,
} from './config.js';
import { PALETTE } from './styles/palette.js';

const PROGRESS_SPINNER = {
  interval: 80,
  frames: ['░░░', '▒░░', '▒▒░', '▒▒▒', '▓▒▒', '▓▓▒', '▓▓▓', '▒▓▓', '░▒▓'],
};

const LETTER_MAP: Record<string, string[]> = {
  O: [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '],
  P: ['█████ ', '██  ██', '█████ ', '██    ', '██    '],
  E: ['██████', '██    ', '█████ ', '██    ', '██████'],
  N: ['██  ██', '███ ██', '██ ███', '██  ██', '██  ██'],
  S: [' █████', '██    ', ' ████ ', '    ██', '█████ '],
  C: [' █████', '██    ', '██    ', '██    ', ' █████'],
  ' ': ['  ', '  ', '  ', '  ', '  '],
};

type ToolLabel = {
  primary: string;
  annotation?: string;
};

const sanitizeToolLabel = (raw: string): string =>
  raw.replace(/✅/gu, '✔').trim();

const parseToolLabel = (raw: string): ToolLabel => {
  const sanitized = sanitizeToolLabel(raw);
  const match = sanitized.match(/^(.*?)\s*\((.+)\)$/u);
  if (!match) {
    return { primary: sanitized };
  }
  return {
    primary: match[1].trim(),
    annotation: match[2].trim(),
  };
};

const isSelectableChoice = (
  choice: ToolWizardChoice
): choice is Extract<ToolWizardChoice, { selectable: true }> => choice.selectable;

type ToolWizardChoice =
  | {
      kind: 'heading' | 'info';
      value: string;
      label: ToolLabel;
      selectable: false;
    }
  | {
      kind: 'option';
      value: string;
      label: ToolLabel;
      configured: boolean;
      selectable: true;
    };

type ToolWizardConfig = {
  extendMode: boolean;
  baseMessage: string;
  choices: ToolWizardChoice[];
  initialSelected?: string[];
};

type WizardStep = 'intro' | 'select' | 'review';

type ToolSelectionPrompt = (config: ToolWizardConfig) => Promise<string[]>;

type RootStubStatus = 'created' | 'updated' | 'skipped';

const ROOT_STUB_CHOICE_VALUE = '__root_stub__';

const OTHER_TOOLS_HEADING_VALUE = '__heading-other__';
const LIST_SPACER_VALUE = '__list-spacer__';

const toolSelectionWizard = createPrompt<string[], ToolWizardConfig>(
  (config, done) => {
    const totalSteps = 3;
    const [step, setStep] = useState<WizardStep>('intro');
    const selectableChoices = config.choices.filter(isSelectableChoice);
    const initialCursorIndex = config.choices.findIndex((choice) =>
      choice.selectable
    );
    const [cursor, setCursor] = useState<number>(
      initialCursorIndex === -1 ? 0 : initialCursorIndex
    );
    const [selected, setSelected] = useState<string[]>(() => {
      const initial = new Set(
        (config.initialSelected ?? []).filter((value) =>
          selectableChoices.some((choice) => choice.value === value)
        )
      );
      return selectableChoices
        .map((choice) => choice.value)
        .filter((value) => initial.has(value));
    });
    const [error, setError] = useState<string | null>(null);

    const selectedSet = new Set(selected);
    const pageSize = Math.max(config.choices.length, 1);

    const updateSelected = (next: Set<string>) => {
      const ordered = selectableChoices
        .map((choice) => choice.value)
        .filter((value) => next.has(value));
      setSelected(ordered);
    };

    const page = usePagination({
      items: config.choices,
      active: cursor,
      pageSize,
      loop: false,
      renderItem: ({ item, isActive }) => {
        if (!item.selectable) {
          const prefix = item.kind === 'info' ? '  ' : '';
          const textColor =
            item.kind === 'heading' ? PALETTE.lightGray : PALETTE.midGray;
          return `${PALETTE.midGray(' ')} ${PALETTE.midGray(' ')} ${textColor(
            `${prefix}${item.label.primary}`
          )}`;
        }

        const isSelected = selectedSet.has(item.value);
        const cursorSymbol = isActive
          ? PALETTE.white('›')
          : PALETTE.midGray(' ');
        const indicator = isSelected
          ? PALETTE.white('◉')
          : PALETTE.midGray('○');
        const nameColor = isActive ? PALETTE.white : PALETTE.midGray;
        const annotation = item.label.annotation
          ? PALETTE.midGray(` (${item.label.annotation})`)
          : '';
        const configuredNote = item.configured
          ? PALETTE.midGray(' (已配置)')
          : '';
        const label = `${nameColor(item.label.primary)}${annotation}${configuredNote}`;
        return `${cursorSymbol} ${indicator} ${label}`;
      },
    });

    const moveCursor = (direction: 1 | -1) => {
      if (selectableChoices.length === 0) {
        return;
      }

      let nextIndex = cursor;
      while (true) {
        nextIndex = nextIndex + direction;
        if (nextIndex < 0 || nextIndex >= config.choices.length) {
          return;
        }

        if (config.choices[nextIndex]?.selectable) {
          setCursor(nextIndex);
          return;
        }
      }
    };

    useKeypress((key) => {
      if (step === 'intro') {
        if (isEnterKey(key)) {
          setStep('select');
        }
        return;
      }

      if (step === 'select') {
        if (isUpKey(key)) {
          moveCursor(-1);
          setError(null);
          return;
        }

        if (isDownKey(key)) {
          moveCursor(1);
          setError(null);
          return;
        }

        if (isSpaceKey(key)) {
          const current = config.choices[cursor];
          if (!current || !current.selectable) return;

          const next = new Set(selected);
          if (next.has(current.value)) {
            next.delete(current.value);
          } else {
            next.add(current.value);
          }

          updateSelected(next);
          setError(null);
          return;
        }

        if (isEnterKey(key)) {
          const current = config.choices[cursor];
          if (
            current &&
            current.selectable &&
            !selectedSet.has(current.value)
          ) {
            const next = new Set(selected);
            next.add(current.value);
            updateSelected(next);
          }
          setStep('review');
          setError(null);
          return;
        }

        if (key.name === 'escape') {
          const next = new Set<string>();
          updateSelected(next);
          setError(null);
        }
        return;
      }

      if (step === 'review') {
        if (isEnterKey(key)) {
          const finalSelection = config.choices
            .map((choice) => choice.value)
            .filter(
              (value) =>
                selectedSet.has(value) && value !== ROOT_STUB_CHOICE_VALUE
            );
          done(finalSelection);
          return;
        }

        if (isBackspaceKey(key) || key.name === 'escape') {
          setStep('select');
          setError(null);
        }
      }
    });

    const rootStubChoice = selectableChoices.find(
      (choice) => choice.value === ROOT_STUB_CHOICE_VALUE
    );
    const rootStubSelected = rootStubChoice
      ? selectedSet.has(ROOT_STUB_CHOICE_VALUE)
      : false;
    const nativeChoices = selectableChoices.filter(
      (choice) => choice.value !== ROOT_STUB_CHOICE_VALUE
    );
    const selectedNativeChoices = nativeChoices.filter((choice) =>
      selectedSet.has(choice.value)
    );

    const formatSummaryLabel = (
      choice: Extract<ToolWizardChoice, { selectable: true }>
    ) => {
      const annotation = choice.label.annotation
        ? PALETTE.midGray(` (${choice.label.annotation})`)
        : '';
      const configuredNote = choice.configured
        ? PALETTE.midGray(' (已配置)')
        : '';
      return `${PALETTE.white(choice.label.primary)}${annotation}${configuredNote}`;
    };

    const stepIndex = step === 'intro' ? 1 : step === 'select' ? 2 : 3;
    const lines: string[] = [];
    lines.push(PALETTE.midGray(`Step ${stepIndex}/${totalSteps}`));
    lines.push('');

    if (step === 'intro') {
      const introHeadline = config.extendMode
        ? '擴充您的 OpenSpec 工具'
        : '配置您的 OpenSpec 工具';
      const introBody = config.extendMode
        ? '偵測到現有設定。我們將協助您更新或新增整合。'
        : '讓我們連接您的 AI 助手，使其了解 OpenSpec。';

      lines.push(PALETTE.white(introHeadline));
      lines.push(PALETTE.midGray(introBody));
      lines.push('');
      lines.push(PALETTE.midGray('按 Enter 繼續。'));
    } else if (step === 'select') {
      lines.push(PALETTE.white(config.baseMessage));
      lines.push(
        PALETTE.midGray(
          '使用 ↑/↓ 移動 · 空白鍵切換 · Enter 選擇已標記的工具並審查。'
        )
      );
      lines.push('');
      lines.push(page);
      lines.push('');
      lines.push(PALETTE.midGray('已選擇的配置：'));
      if (rootStubSelected && rootStubChoice) {
        lines.push(
          `  ${PALETTE.white('-')} ${formatSummaryLabel(rootStubChoice)}`
        );
      }
      if (selectedNativeChoices.length === 0) {
        lines.push(
          `  ${PALETTE.midGray('- 未選擇原生支援的提供者')}`
        );
      } else {
        selectedNativeChoices.forEach((choice) => {
          lines.push(
            `  ${PALETTE.white('-')} ${formatSummaryLabel(choice)}`
          );
        });
      }
    } else {
      lines.push(PALETTE.white('審查選擇'));
      lines.push(
        PALETTE.midGray('按 Enter 確認或 Backspace 調整。')
      );
      lines.push('');

      if (rootStubSelected && rootStubChoice) {
        lines.push(
          `${PALETTE.white('▌')} ${formatSummaryLabel(rootStubChoice)}`
        );
      }

      if (selectedNativeChoices.length === 0) {
        lines.push(
          PALETTE.midGray(
            '未選擇原生支援的提供者。通用指令仍將套用。'
          )
        );
      } else {
        selectedNativeChoices.forEach((choice) => {
          lines.push(
            `${PALETTE.white('▌')} ${formatSummaryLabel(choice)}`
          );
        });
      }
    }

    if (error) {
      return [lines.join('\n'), chalk.red(error)];
    }

    return lines.join('\n');
  }
);

type InitCommandOptions = {
  prompt?: ToolSelectionPrompt;
  tools?: string;
};

export class InitCommand {
  private readonly prompt: ToolSelectionPrompt;
  private readonly toolsArg?: string;

  constructor(options: InitCommandOptions = {}) {
    this.prompt = options.prompt ?? ((config) => toolSelectionWizard(config));
    this.toolsArg = options.tools;
  }

  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    const openspecDir = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(projectPath, openspecDir);

    // Validation happens silently in the background
    const extendMode = await this.validate(projectPath, openspecPath);
    const existingToolStates = await this.getExistingToolStates(projectPath, extendMode);

    this.renderBanner(extendMode);

    // Get configuration (after validation to avoid prompts if validation fails)
    const config = await this.getConfiguration(existingToolStates, extendMode);

    const availableTools = AI_TOOLS.filter((tool) => tool.available);
    const selectedIds = new Set(config.aiTools);
    const selectedTools = availableTools.filter((tool) =>
      selectedIds.has(tool.value)
    );
    const created = selectedTools.filter(
      (tool) => !existingToolStates[tool.value]
    );
    const refreshed = selectedTools.filter(
      (tool) => existingToolStates[tool.value]
    );
    const skippedExisting = availableTools.filter(
      (tool) => !selectedIds.has(tool.value) && existingToolStates[tool.value]
    );
    const skipped = availableTools.filter(
      (tool) => !selectedIds.has(tool.value) && !existingToolStates[tool.value]
    );

    // Step 1: Create directory structure
    if (!extendMode) {
      const structureSpinner = this.startSpinner(
        '建立 OpenSpec 結構...'
      );
      await this.createDirectoryStructure(openspecPath);
      await this.generateFiles(openspecPath, config);
      structureSpinner.stopAndPersist({
        symbol: PALETTE.white('▌'),
        text: PALETTE.white('OpenSpec 結構已建立'),
      });
    } else {
      ora({ stream: process.stdout }).info(
        PALETTE.midGray(
          'ℹ OpenSpec 已初始化。正在檢查缺少的檔案...'
        )
      );
      await this.createDirectoryStructure(openspecPath);
      await this.ensureTemplateFiles(openspecPath, config);
    }

    // Step 2: Configure AI tools
    const toolSpinner = this.startSpinner('配置 AI 工具中...');
    const rootStubStatus = await this.configureAITools(
      projectPath,
      openspecDir,
      config.aiTools
    );
    toolSpinner.stopAndPersist({
      symbol: PALETTE.white('▌'),
      text: PALETTE.white('AI 工具已配置'),
    });

    // Success message
    this.displaySuccessMessage(
      selectedTools,
      created,
      refreshed,
      skippedExisting,
      skipped,
      extendMode,
      rootStubStatus
    );
  }

  private async validate(
    projectPath: string,
    _openspecPath: string
  ): Promise<boolean> {
    const extendMode = await FileSystemUtils.directoryExists(_openspecPath);

    // Check write permissions
    if (!(await FileSystemUtils.ensureWritePermissions(projectPath))) {
      throw new Error(`權限不足，無法寫入至 ${projectPath}`);
    }
    return extendMode;
  }

  private async getConfiguration(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<OpenSpecConfig> {
    const selectedTools = await this.getSelectedTools(existingTools, extendMode);
    return { aiTools: selectedTools };
  }

  private async getSelectedTools(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<string[]> {
    const nonInteractiveSelection = this.resolveToolsArg();
    if (nonInteractiveSelection !== null) {
      return nonInteractiveSelection;
    }

    // Fall back to interactive mode
    return this.promptForAITools(existingTools, extendMode);
  }

  private resolveToolsArg(): string[] | null {
    if (typeof this.toolsArg === 'undefined') {
      return null;
    }

    const raw = this.toolsArg.trim();
    if (raw.length === 0) {
      throw new Error(
        '--tools 選項需要一個值。請使用 "all"、"none" 或以逗號分隔的工具 ID 列表。'
      );
    }

    const availableTools = AI_TOOLS.filter((tool) => tool.available);
    const availableValues = availableTools.map((tool) => tool.value);
    const availableSet = new Set(availableValues);
    const availableList = ['all', 'none', ...availableValues].join(', ');

    const lowerRaw = raw.toLowerCase();
    if (lowerRaw === 'all') {
      return availableValues;
    }

    if (lowerRaw === 'none') {
      return [];
    }

    const tokens = raw
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    if (tokens.length === 0) {
      throw new Error(
        '未使用 "all" 或 "none" 時，--tools 選項至少需要一個工具 ID。'
      );
    }

    const normalizedTokens = tokens.map((token) => token.toLowerCase());

    if (normalizedTokens.some((token) => token === 'all' || token === 'none')) {
      throw new Error('不能將保留值 "all" 或 "none" 與特定工具 ID 組合使用。');
    }

    const invalidTokens = tokens.filter(
      (_token, index) => !availableSet.has(normalizedTokens[index])
    );

    if (invalidTokens.length > 0) {
      throw new Error(
        `無效的工具：${invalidTokens.join(', ')}。可用值：${availableList}`
      );
    }

    const deduped: string[] = [];
    for (const token of normalizedTokens) {
      if (!deduped.includes(token)) {
        deduped.push(token);
      }
    }

    return deduped;
  }

  private async promptForAITools(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<string[]> {
    const availableTools = AI_TOOLS.filter((tool) => tool.available);

    const baseMessage = extendMode
      ? '您想新增或更新哪些原生支援的 AI 工具？'
      : '您使用哪些原生支援的 AI 工具？';
    const initialNativeSelection = extendMode
      ? availableTools
          .filter((tool) => existingTools[tool.value])
          .map((tool) => tool.value)
      : [];

    const initialSelected = Array.from(new Set(initialNativeSelection));

    const choices: ToolWizardChoice[] = [
      {
        kind: 'heading',
        value: '__heading-native__',
        label: {
          primary:
            'Natively supported providers (✔ OpenSpec custom slash commands available)',
        },
        selectable: false,
      },
      ...availableTools.map<ToolWizardChoice>((tool) => ({
        kind: 'option',
        value: tool.value,
        label: parseToolLabel(tool.name),
        configured: Boolean(existingTools[tool.value]),
        selectable: true,
      })),
      ...(availableTools.length
        ? ([
            {
              kind: 'info' as const,
              value: LIST_SPACER_VALUE,
              label: { primary: '' },
              selectable: false,
            },
          ] as ToolWizardChoice[])
        : []),
      {
        kind: 'heading',
        value: OTHER_TOOLS_HEADING_VALUE,
        label: {
          primary:
            'Other tools (use Universal AGENTS.md for Amp, VS Code, GitHub Copilot, …)',
        },
        selectable: false,
      },
      {
        kind: 'option',
        value: ROOT_STUB_CHOICE_VALUE,
        label: {
          primary: 'Universal AGENTS.md',
          annotation: 'always available',
        },
        configured: extendMode,
        selectable: true,
      },
    ];

    return this.prompt({
      extendMode,
      baseMessage,
      choices,
      initialSelected,
    });
  }

  private async getExistingToolStates(
    projectPath: string,
    extendMode: boolean
  ): Promise<Record<string, boolean>> {
    // Fresh initialization - no tools configured yet
    if (!extendMode) {
      return Object.fromEntries(AI_TOOLS.map(t => [t.value, false]));
    }

    // Extend mode - check all tools in parallel for better performance
    const entries = await Promise.all(
      AI_TOOLS.map(async (t) => [t.value, await this.isToolConfigured(projectPath, t.value)] as const)
    );
    return Object.fromEntries(entries);
  }

  private async isToolConfigured(
    projectPath: string,
    toolId: string
  ): Promise<boolean> {
    // A tool is only considered "configured by OpenSpec" if its files contain OpenSpec markers.
    // For tools with both config files and slash commands, BOTH must have markers.
    // For slash commands, at least one file with markers is sufficient (not all required).

    // Helper to check if a file exists and contains OpenSpec markers
    const fileHasMarkers = async (absolutePath: string): Promise<boolean> => {
      try {
        const content = await FileSystemUtils.readFile(absolutePath);
        return content.includes(OPENSPEC_MARKERS.start) && content.includes(OPENSPEC_MARKERS.end);
      } catch {
        return false;
      }
    };

    let hasConfigFile = false;
    let hasSlashCommands = false;

    // Check if the tool has a config file with OpenSpec markers
    const configFile = ToolRegistry.get(toolId)?.configFileName;
    if (configFile) {
      const configPath = path.join(projectPath, configFile);
      hasConfigFile = (await FileSystemUtils.fileExists(configPath)) && (await fileHasMarkers(configPath));
    }

    // Check if any slash command file exists with OpenSpec markers
    const slashConfigurator = SlashCommandRegistry.get(toolId);
    if (slashConfigurator) {
      for (const target of slashConfigurator.getTargets()) {
        const absolute = slashConfigurator.resolveAbsolutePath(projectPath, target.id);
        if ((await FileSystemUtils.fileExists(absolute)) && (await fileHasMarkers(absolute))) {
          hasSlashCommands = true;
          break; // At least one file with markers is sufficient
        }
      }
    }

    // Tool is only configured if BOTH exist with markers
    // OR if the tool has no config file requirement (slash commands only)
    // OR if the tool has no slash commands requirement (config file only)
    const hasConfigFileRequirement = configFile !== undefined;
    const hasSlashCommandRequirement = slashConfigurator !== undefined;

    if (hasConfigFileRequirement && hasSlashCommandRequirement) {
      // Both are required - both must be present with markers
      return hasConfigFile && hasSlashCommands;
    } else if (hasConfigFileRequirement) {
      // Only config file required
      return hasConfigFile;
    } else if (hasSlashCommandRequirement) {
      // Only slash commands required
      return hasSlashCommands;
    }

    return false;
  }

  private async createDirectoryStructure(openspecPath: string): Promise<void> {
    const directories = [
      openspecPath,
      path.join(openspecPath, 'specs'),
      path.join(openspecPath, 'changes'),
      path.join(openspecPath, 'changes', 'archive'),
    ];

    for (const dir of directories) {
      await FileSystemUtils.createDirectory(dir);
    }
  }

  private async generateFiles(
    openspecPath: string,
    config: OpenSpecConfig
  ): Promise<void> {
    await this.writeTemplateFiles(openspecPath, config, false);
  }

  private async ensureTemplateFiles(
    openspecPath: string,
    config: OpenSpecConfig
  ): Promise<void> {
    await this.writeTemplateFiles(openspecPath, config, true);
  }

  private async writeTemplateFiles(
    openspecPath: string,
    config: OpenSpecConfig,
    skipExisting: boolean
  ): Promise<void> {
    const context: ProjectContext = {
      // Could be enhanced with prompts for project details
    };

    const templates = TemplateManager.getTemplates(context);

    for (const template of templates) {
      const filePath = path.join(openspecPath, template.path);

      // Skip if file exists and we're in skipExisting mode
      if (skipExisting && (await FileSystemUtils.fileExists(filePath))) {
        continue;
      }

      const content =
        typeof template.content === 'function'
          ? template.content(context)
          : template.content;

      await FileSystemUtils.writeFile(filePath, content);
    }
  }

  private async configureAITools(
    projectPath: string,
    openspecDir: string,
    toolIds: string[]
  ): Promise<RootStubStatus> {
    const rootStubStatus = await this.configureRootAgentsStub(
      projectPath,
      openspecDir
    );

    for (const toolId of toolIds) {
      const configurator = ToolRegistry.get(toolId);
      if (configurator && configurator.isAvailable) {
        await configurator.configure(projectPath, openspecDir);
      }

      const slashConfigurator = SlashCommandRegistry.get(toolId);
      if (slashConfigurator && slashConfigurator.isAvailable) {
        await slashConfigurator.generateAll(projectPath, openspecDir);
      }
    }

    return rootStubStatus;
  }

  private async configureRootAgentsStub(
    projectPath: string,
    openspecDir: string
  ): Promise<RootStubStatus> {
    const configurator = ToolRegistry.get('agents');
    if (!configurator || !configurator.isAvailable) {
      return 'skipped';
    }

    const stubPath = path.join(projectPath, configurator.configFileName);
    const existed = await FileSystemUtils.fileExists(stubPath);

    await configurator.configure(projectPath, openspecDir);

    return existed ? 'updated' : 'created';
  }

  private displaySuccessMessage(
    selectedTools: AIToolOption[],
    created: AIToolOption[],
    refreshed: AIToolOption[],
    skippedExisting: AIToolOption[],
    skipped: AIToolOption[],
    extendMode: boolean,
    rootStubStatus: RootStubStatus
  ): void {
    console.log(); // Empty line for spacing
    const successHeadline = extendMode
      ? 'OpenSpec 工具配置已更新！'
      : 'OpenSpec 初始化成功！';
    ora().succeed(PALETTE.white(successHeadline));

    console.log();
    console.log(PALETTE.lightGray('工具摘要：'));
    const summaryLines = [
      rootStubStatus === 'created'
        ? `${PALETTE.white('▌')} ${PALETTE.white(
            '已為其他助手建立根目錄 AGENTS.md'
          )}`
        : null,
      rootStubStatus === 'updated'
        ? `${PALETTE.lightGray('▌')} ${PALETTE.lightGray(
            '已為其他助手更新根目錄 AGENTS.md'
          )}`
        : null,
      created.length
        ? `${PALETTE.white('▌')} ${PALETTE.white(
            '已建立：'
          )} ${this.formatToolNames(created)}`
        : null,
      refreshed.length
        ? `${PALETTE.lightGray('▌')} ${PALETTE.lightGray(
            '已更新：'
          )} ${this.formatToolNames(refreshed)}`
        : null,
      skippedExisting.length
        ? `${PALETTE.midGray('▌')} ${PALETTE.midGray(
            '已跳過（已配置）：'
          )} ${this.formatToolNames(skippedExisting)}`
        : null,
      skipped.length
        ? `${PALETTE.darkGray('▌')} ${PALETTE.darkGray(
            '已跳過：'
          )} ${this.formatToolNames(skipped)}`
        : null,
    ].filter((line): line is string => Boolean(line));
    for (const line of summaryLines) {
      console.log(line);
    }

    console.log();
    console.log(
      PALETTE.midGray(
        '未來請使用 `openspec-tw update` 更新共享的 OpenSpec 指令。'
      )
    );

    // Get the selected tool name(s) for display
    const toolName = this.formatToolNames(selectedTools);

    console.log();
    console.log(`後續步驟 - 將這些提示複製到 ${toolName}：`);
    console.log(
      chalk.gray('────────────────────────────────────────────────────────────')
    );
    console.log(PALETTE.white('1. 填寫專案資訊：'));
    console.log(
      PALETTE.lightGray(
        '   "請閱讀 openspec/project.md 並幫我填寫'
      )
    );
    console.log(
      PALETTE.lightGray(
        '    專案詳情、技術堆疊和慣例"\n'
      )
    );
    console.log(PALETTE.white('2. 建立第一個變更提案：'));
    console.log(
      PALETTE.lightGray(
        '   "我想新增 [您的功能]。請建立一個'
      )
    );
    console.log(
      PALETTE.lightGray('    OpenSpec 變更提案"\n')
    );
    console.log(PALETTE.white('3. 了解 OpenSpec 工作流程：'));
    console.log(
      PALETTE.lightGray(
        '   "請從 openspec/AGENTS.md 解釋 OpenSpec 工作流程'
      )
    );
    console.log(
      PALETTE.lightGray('    以及我應如何與您在此專案上協作"')
    );
    console.log(
      PALETTE.darkGray(
        '────────────────────────────────────────────────────────────\n'
      )
    );

    // Codex heads-up: prompts installed globally
    const selectedToolIds = new Set(selectedTools.map((t) => t.value));
    if (selectedToolIds.has('codex')) {
      console.log(PALETTE.white('Codex 設定說明'));
      console.log(
        PALETTE.midGray('提示已安裝至 ~/.codex/prompts（或 $CODEX_HOME/prompts）。')
      );
      console.log();
    }
  }

  private formatToolNames(tools: AIToolOption[]): string {
    const names = tools
      .map((tool) => tool.successLabel ?? tool.name)
      .filter((name): name is string => Boolean(name));

    if (names.length === 0)
      return PALETTE.lightGray('您的 AGENTS.md 相容助手');
    if (names.length === 1) return PALETTE.white(names[0]);

    const base = names.slice(0, -1).map((name) => PALETTE.white(name));
    const last = PALETTE.white(names[names.length - 1]);

    return `${base.join(PALETTE.midGray(', '))}${
      base.length ? PALETTE.midGray(', and ') : ''
    }${last}`;
  }

  private renderBanner(_extendMode: boolean): void {
    const rows = ['', '', '', '', ''];
    for (const char of 'OPENSPEC') {
      const glyph = LETTER_MAP[char] ?? LETTER_MAP[' '];
      for (let i = 0; i < rows.length; i += 1) {
        rows[i] += `${glyph[i]}  `;
      }
    }

    const rowStyles = [
      PALETTE.white,
      PALETTE.lightGray,
      PALETTE.midGray,
      PALETTE.lightGray,
      PALETTE.white,
    ];

    console.log();
    rows.forEach((row, index) => {
      console.log(rowStyles[index](row.replace(/\s+$/u, '')));
    });
    console.log();
    console.log(PALETTE.white('歡迎使用 OpenSpec！'));
    console.log();
  }

  private startSpinner(text: string) {
    return ora({
      text,
      stream: process.stdout,
      color: 'gray',
      spinner: PROGRESS_SPINNER,
    }).start();
  }
}
