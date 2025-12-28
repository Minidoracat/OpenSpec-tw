import { CommandDefinition, FlagDefinition } from './types.js';

/**
 * Common flags used across multiple commands
 */
const COMMON_FLAGS = {
  json: {
    name: 'json',
    description: '輸出為 JSON',
  } as FlagDefinition,
  jsonValidation: {
    name: 'json',
    description: '輸出驗證結果為 JSON',
  } as FlagDefinition,
  strict: {
    name: 'strict',
    description: '啟用嚴格驗證模式',
  } as FlagDefinition,
  noInteractive: {
    name: 'no-interactive',
    description: '停用互動式提示',
  } as FlagDefinition,
  type: {
    name: 'type',
    description: '指定項目類型（當不明確時）',
    takesValue: true,
    values: ['change', 'spec'],
  } as FlagDefinition,
} as const;

/**
 * Registry of all OpenSpec CLI commands with their flags and metadata.
 * This registry is used to generate shell completion scripts.
 */
export const COMMAND_REGISTRY: CommandDefinition[] = [
  {
    name: 'init',
    description: '在您的專案中初始化 OpenSpec',
    acceptsPositional: true,
    positionalType: 'path',
    flags: [
      {
        name: 'tools',
        description: '非互動式配置 AI 工具（例如「all」、「none」或逗號分隔的工具 ID）',
        takesValue: true,
      },
    ],
  },
  {
    name: 'update',
    description: '更新 OpenSpec 指令檔案',
    acceptsPositional: true,
    positionalType: 'path',
    flags: [],
  },
  {
    name: 'list',
    description: '列出項目（預設為變更，使用 --specs 列出規範）',
    flags: [
      {
        name: 'specs',
        description: '列出規範而非變更',
      },
      {
        name: 'changes',
        description: '明確列出變更（預設）',
      },
    ],
  },
  {
    name: 'view',
    description: '顯示規範和變更的互動式儀表板',
    flags: [],
  },
  {
    name: 'validate',
    description: '驗證變更和規範',
    acceptsPositional: true,
    positionalType: 'change-or-spec-id',
    flags: [
      {
        name: 'all',
        description: '驗證所有變更和規範',
      },
      {
        name: 'changes',
        description: '驗證所有變更',
      },
      {
        name: 'specs',
        description: '驗證所有規範',
      },
      COMMON_FLAGS.type,
      COMMON_FLAGS.strict,
      COMMON_FLAGS.jsonValidation,
      {
        name: 'concurrency',
        description: '最大並發驗證數（預設為環境變數 OPENSPEC_CONCURRENCY 或 6）',
        takesValue: true,
      },
      COMMON_FLAGS.noInteractive,
    ],
  },
  {
    name: 'show',
    description: '顯示變更或規範',
    acceptsPositional: true,
    positionalType: 'change-or-spec-id',
    flags: [
      COMMON_FLAGS.json,
      COMMON_FLAGS.type,
      COMMON_FLAGS.noInteractive,
      {
        name: 'deltas-only',
        description: '僅顯示差異（僅限 JSON，變更專用）',
      },
      {
        name: 'requirements-only',
        description: '--deltas-only 的別名（已棄用，變更專用）',
      },
      {
        name: 'requirements',
        description: '僅顯示需求，排除情境（僅限 JSON，規範專用）',
      },
      {
        name: 'no-scenarios',
        description: '排除情境內容（僅限 JSON，規範專用）',
      },
      {
        name: 'requirement',
        short: 'r',
        description: '按 ID 顯示特定需求（僅限 JSON，規範專用）',
        takesValue: true,
      },
    ],
  },
  {
    name: 'archive',
    description: '封存已完成的變更並更新主要規範',
    acceptsPositional: true,
    positionalType: 'change-id',
    flags: [
      {
        name: 'yes',
        short: 'y',
        description: '跳過確認提示',
      },
      {
        name: 'skip-specs',
        description: '跳過規範更新操作',
      },
      {
        name: 'no-validate',
        description: '跳過驗證（不建議）',
      },
    ],
  },
  {
    name: 'change',
    description: '管理 OpenSpec 變更提案（已棄用）',
    flags: [],
    subcommands: [
      {
        name: 'show',
        description: '顯示變更提案',
        acceptsPositional: true,
        positionalType: 'change-id',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'deltas-only',
            description: '僅顯示差異（僅限 JSON）',
          },
          {
            name: 'requirements-only',
            description: '--deltas-only 的別名（已棄用）',
          },
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'list',
        description: '列出所有活動變更（已棄用）',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'long',
            description: '顯示 ID 和標題及計數',
          },
        ],
      },
      {
        name: 'validate',
        description: '驗證變更提案',
        acceptsPositional: true,
        positionalType: 'change-id',
        flags: [
          COMMON_FLAGS.strict,
          COMMON_FLAGS.jsonValidation,
          COMMON_FLAGS.noInteractive,
        ],
      },
    ],
  },
  {
    name: 'spec',
    description: '管理 OpenSpec 規範',
    flags: [],
    subcommands: [
      {
        name: 'show',
        description: '顯示規範',
        acceptsPositional: true,
        positionalType: 'spec-id',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'requirements',
            description: '僅顯示需求，排除情境（僅限 JSON）',
          },
          {
            name: 'no-scenarios',
            description: '排除情境內容（僅限 JSON）',
          },
          {
            name: 'requirement',
            short: 'r',
            description: '按 ID 顯示特定需求（僅限 JSON）',
            takesValue: true,
          },
          COMMON_FLAGS.noInteractive,
        ],
      },
      {
        name: 'list',
        description: '列出所有規範',
        flags: [
          COMMON_FLAGS.json,
          {
            name: 'long',
            description: '顯示 ID 和標題及計數',
          },
        ],
      },
      {
        name: 'validate',
        description: '驗證規範',
        acceptsPositional: true,
        positionalType: 'spec-id',
        flags: [
          COMMON_FLAGS.strict,
          COMMON_FLAGS.jsonValidation,
          COMMON_FLAGS.noInteractive,
        ],
      },
    ],
  },
  {
    name: 'completion',
    description: '管理 OpenSpec CLI 的 shell 自動補全',
    flags: [],
    subcommands: [
      {
        name: 'generate',
        description: '產生指定 shell 的補全腳本（輸出到標準輸出）',
        acceptsPositional: true,
        positionalType: 'shell',
        flags: [],
      },
      {
        name: 'install',
        description: '安裝指定 shell 的補全腳本',
        acceptsPositional: true,
        positionalType: 'shell',
        flags: [
          {
            name: 'verbose',
            description: '顯示詳細安裝輸出',
          },
        ],
      },
      {
        name: 'uninstall',
        description: '解除安裝指定 shell 的補全腳本',
        acceptsPositional: true,
        positionalType: 'shell',
        flags: [],
      },
    ],
  },
  {
    name: 'config',
    description: '檢視和修改全域 OpenSpec 配置',
    flags: [
      {
        name: 'scope',
        description: '配置範圍（目前僅支援「global」）',
        takesValue: true,
        values: ['global'],
      },
    ],
    subcommands: [
      {
        name: 'path',
        description: '顯示配置檔案位置',
        flags: [],
      },
      {
        name: 'list',
        description: '顯示所有目前設定',
        flags: [
          COMMON_FLAGS.json,
        ],
      },
      {
        name: 'get',
        description: '取得特定值（原始格式，可用於腳本）',
        acceptsPositional: true,
        flags: [],
      },
      {
        name: 'set',
        description: '設定值（自動轉換類型）',
        acceptsPositional: true,
        flags: [
          {
            name: 'string',
            description: '強制將值儲存為字串',
          },
          {
            name: 'allow-unknown',
            description: '允許設定未知的鍵',
          },
        ],
      },
      {
        name: 'unset',
        description: '移除鍵（還原為預設值）',
        acceptsPositional: true,
        flags: [],
      },
      {
        name: 'reset',
        description: '重設配置為預設值',
        flags: [
          {
            name: 'all',
            description: '重設所有配置（必要）',
          },
          {
            name: 'yes',
            short: 'y',
            description: '跳過確認提示',
          },
        ],
      },
      {
        name: 'edit',
        description: '在 $EDITOR 中開啟配置',
        flags: [],
      },
    ],
  },
];
