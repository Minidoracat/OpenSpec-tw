# @minidoracat/openspec-tw

## 0.13.1

### Patch Changes

- 修復繁體中文格式驗證問題

  **核心修復**：

  - 新增多語言區段標題映射系統 (`src/core/i18n/section-titles.ts`)
  - 實作遞迴區段搜尋功能，修復巢狀區段解析問題
  - 支援繁體中文和英文雙語 Markdown 格式同時使用

  **支援的繁體中文標題**：

  - `## 目的` / `## Purpose`
  - `## 需求` / `## Requirements`
  - `## 為什麼` / `## Why`
  - `## 變更內容` / `## What Changes`
  - `## 新增需求` / `## ADDED Requirements`
  - `## 修改需求` / `## MODIFIED Requirements`
  - `## 移除需求` / `## REMOVED Requirements`
  - `## 重新命名需求` / `## RENAMED Requirements`
  - `### 需求：` / `### Requirement:`
  - `#### 情境：` / `#### Scenario:`

  **完整翻譯**：

  - 所有驗證錯誤訊息翻譯為繁體中文
  - 指引訊息和幫助文字完整本地化
  - Delta spec 驗證訊息繁體化

  **相容性**：

  - 大小寫不敏感的標題匹配
  - 同時支援英文和繁體中文格式
  - 向後相容原有英文格式

  **測試改進**：

  - 更新所有測試案例以驗證繁體中文訊息
  - 測試通過率從 93% 提升至 99.6%（242/243 通過）

## 0.13.0

### Minor Changes

- 71b25de: 繁體中文本地化版本

  - 完成所有使用者介面訊息的繁體中文翻譯
  - 更新套件名稱為 @minidoracat/openspec-tw
  - 更新命令名稱為 openspec-tw
  - 翻譯所有模板系統（AGENTS.md、slash 命令等）
  - 完成測試斷言的本地化更新
  - 修正 CI 配置以支援自動發布

## 0.13.0-tw.1 - 2025-10-28

### 繁體中文本地化版本

這是 OpenSpec 的繁體中文版本，基於原版 [v0.13.0](https://github.com/Fission-AI/OpenSpec/releases/tag/0.13.0)。

#### 品牌更新

- 套件名稱：`@fission-ai/openspec` → `@minidoracat/openspec-tw`
- 命令名稱：`openspec` → `openspec-tw`
- 儲存庫：`Fission-AI/OpenSpec` → `Minidoracat/OpenSpec-tw`

#### 繁體中文本地化內容

- ✅ **使用者文件**：README.md 完整翻譯
- ✅ **AI 助手整合**：AGENTS.md 和 openspec/AGENTS.md 翻譯
- ✅ **模板系統**：agents-template.ts、project-template.ts、cline-template.ts 翻譯
- ✅ **Slash 命令**：slash-command-templates.ts 所有命令模板翻譯
- ✅ **CLI 介面**：
  - src/cli/index.ts - 主進入點和所有命令描述
  - src/commands/change.ts - 變更管理命令
  - src/commands/validate.ts - 驗證命令
  - src/core/init.ts - 初始化流程（約 50+ 條訊息）
  - src/core/archive.ts - 封存命令（約 30+ 條訊息）
  - src/core/list.ts - 列表功能
  - src/core/view.ts - 儀表板視圖
  - src/core/update.ts - 更新命令
- ✅ **翻譯統計**：約 200+ 條使用者可見訊息完整翻譯

#### 翻譯原則

- 保留技術術語英文（CLI、JSON、YAML、Markdown）
- 保留 AI 工具名稱（Claude Code、CodeBuddy、Cursor 等）
- 所有使用者介面訊息翻譯為繁體中文
- 中英文混排遵循專業技術文件標準

#### 功能一致性

- 與原版 v0.13.0 功能完全一致
- 支援所有相同的 AI 助手
- 保持所有技術實作和驗證邏輯

---

## 0.13.0

### Minor Changes

- 668a125: Add support for multiple AI assistants and improve validation

  This release adds support for several new AI coding assistants:

  - CodeBuddy Code - AI-powered coding assistant
  - CodeRabbit - AI code review assistant
  - Cline - Claude-powered CLI assistant
  - Crush AI - AI assistant platform
  - Auggie (Augment CLI) - Code augmentation tool

  New features:

  - Archive slash command now supports arguments for more flexible workflows

  Bug fixes:

  - Delta spec validation now handles case-insensitive headers and properly detects empty sections
  - Archive validation now correctly honors --no-validate flag and ignores metadata

  Documentation improvements:

  - Added VS Code dev container configuration for easier development setup
  - Updated AGENTS.md with explicit change-id notation
  - Enhanced slash commands documentation with restart notes

## 0.12.0

### Minor Changes

- 082abb4: Add factory function support for slash commands and non-interactive init options

  This release includes two new features:

  - **Factory function support for slash commands**: Slash commands can now be defined as functions that return command objects, enabling dynamic command configuration
  - **Non-interactive init options**: Added `--tools`, `--all-tools`, and `--skip-tools` CLI flags to `openspec init` for automated initialization in CI/CD pipelines while maintaining backward compatibility with interactive mode

## 0.11.0

### Minor Changes

- 312e1d6: Add Amazon Q Developer CLI integration. OpenSpec now supports Amazon Q Developer with automatic prompt generation in `.amazonq/prompts/` directory, allowing you to use OpenSpec slash commands with Amazon Q's @-syntax.

## 0.10.0

### Minor Changes

- d7e0ce8: Improve init wizard Enter key behavior to allow proceeding through prompts more naturally

## 0.9.2

### Patch Changes

- 2ae0484: Fix cross-platform path handling issues. This release includes fixes for joinPath behavior and slash command path resolution to ensure OpenSpec works correctly across all platforms.

## 0.9.1

### Patch Changes

- 8210970: Fix OpenSpec not working on Windows when Codex integration is selected. This release includes fixes for cross-platform path handling and normalization to ensure OpenSpec works correctly on Windows systems.

## 0.9.0

### Minor Changes

- efbbf3b: Add support for Codex and GitHub Copilot slash commands with YAML frontmatter and $ARGUMENTS

## Unreleased

### Minor Changes

- Add GitHub Copilot slash command support. OpenSpec now writes prompts to `.github/prompts/openspec-{proposal,apply,archive}.prompt.md` with YAML frontmatter and `$ARGUMENTS` placeholder, and refreshes them on `openspec update`.

## 0.8.1

### Patch Changes

- d070d08: Fix CLI version mismatch and add a release guard that validates the packed tarball prints the same version as package.json via `openspec --version`.

## 0.8.0

### Minor Changes

- c29b06d: Add Windsurf support.
- Add Codex slash command support. OpenSpec now writes prompts directly to Codex's global directory (`~/.codex/prompts` or `$CODEX_HOME/prompts`) and refreshes them on `openspec update`.

## 0.7.0

### Minor Changes

- Add native Kilo Code workflow integration so `openspec init` and `openspec update` manage `.kilocode/workflows/openspec-*.md` files.
- Always scaffold the managed root `AGENTS.md` hand-off stub and regroup the AI tool prompts during init/update to keep instructions consistent.

## 0.6.0

### Minor Changes

- Slim the generated root agent instructions down to a managed hand-off stub and update the init/update flows to refresh it safely.

## 0.5.0

### Minor Changes

- feat: implement Phase 1 E2E testing with cross-platform CI matrix

  - Add shared runCLI helper in test/helpers/run-cli.ts for spawn testing
  - Create test/cli-e2e/basic.test.ts covering help, version, validate flows
  - Migrate existing CLI exec tests to use runCLI helper
  - Extend CI matrix to bash (Linux/macOS) and pwsh (Windows)
  - Split PR and main workflows for optimized feedback

### Patch Changes

- Make apply instructions more specific

  Improve agent templates and slash command templates with more specific and actionable apply instructions.

- docs: improve documentation and cleanup

  - Document non-interactive flag for archive command
  - Replace discord badge in README
  - Archive completed changes for better organization

## 0.4.0

### Minor Changes

- Add OpenSpec change proposals for CLI improvements and enhanced user experience
- Add Opencode slash commands support for AI-driven development workflows

### Patch Changes

- Add documentation improvements including --yes flag for archive command template and Discord badge
- Fix normalize line endings in markdown parser to handle CRLF files properly

## 0.3.0

### Minor Changes

- Enhance `openspec init` with extend mode, multi-tool selection, and an interactive `AGENTS.md` configurator.

## 0.2.0

### Minor Changes

- ce5cead: - Add an `openspec view` dashboard that rolls up spec counts and change progress at a glance
  - Generate and update AI slash commands alongside the renamed `openspec/AGENTS.md` instructions file
  - Remove the deprecated `openspec diff` command and direct users to `openspec show`

## 0.1.0

### Minor Changes

- 24b4866: Initial release
