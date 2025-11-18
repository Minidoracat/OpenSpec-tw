# OpenSpec TW

> **專案性質**：Fission-AI OpenSpec 的繁體中文版本，專注繁體中文本地化

## 專案標識

### 核心資訊
- **專案名稱**：OpenSpec TW
- **原版專案**：[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
- **當前專案**：[Minidoracat/OpenSpec-tw](https://github.com/Minidoracat/OpenSpec-tw)
- **套件名稱**：`@minidoracat/openspec-tw`
- **命令名稱**：`openspec-tw`
- **文件語言**：繁體中文

### 核心原則
1. **功能對等**：與原版保持完全一致的功能，不添加新特性
2. **繁體中文化**：專注於繁體中文翻譯和本地化適配
3. **同步優先**：定期與原版同步，保持技術更新

### 關鍵差異
| 專案 | 原版                   | 繁體版                        |
| ---- | ---------------------- | ----------------------------- |
| 套件 | `@fission-ai/openspec` | `@minidoracat/openspec-tw`    |
| 命令 | `openspec`             | `openspec-tw`                 |
| 文件 | English                | 繁體中文                      |
| 倉庫 | Fission-AI/OpenSpec    | Minidoracat/OpenSpec-tw       |

---

## 快速參考

### 常用命令
```bash
# 開發環境
pnpm install                          # 安裝依賴
pnpm run build                        # 建置專案
pnpm run dev                          # 開發模式（監看檔案）
pnpm run dev:cli                      # 本地測試 CLI

# 測試功能
pnpm test                             # 執行測試
pnpm test:watch                       # 監看模式測試
pnpm test:coverage                    # 測試覆蓋率

# CLI 測試
openspec-tw --version                 # 檢查版本
openspec-tw init test-project --tools claude    # 測試專案初始化
openspec-tw list                      # 列出變更
openspec-tw view                      # 互動式儀表板

# 發布相關
pnpm run release:local                # 本地發布測試

# 原版同步（使用 openspec-upstream/ 目錄）
cd openspec-upstream && git fetch origin --tags  # 獲取最新標籤
git tag -l | sort -V | tail -5                   # 查看最新版本
git checkout v0.15.0                              # 檢出目標版本
cd .. && diff -r --brief src openspec-upstream/src  # 比對差異
```

### 專案目錄結構
```
專案根目錄/
├── src/                         # 核心程式碼（必須同步）
│   ├── cli/                    # CLI 進入點
│   ├── commands/               # CLI 命令實作
│   │   ├── change.ts          # 變更管理命令
│   │   ├── show.ts            # 顯示變更詳情
│   │   ├── spec.ts            # 規範管理命令
│   │   └── validate.ts        # 驗證命令
│   ├── core/                   # 核心功能模組
│   │   ├── configurators/     # AI 工具配置器
│   │   │   ├── slash/         # Slash 命令配置
│   │   │   ├── agents.ts      # AGENTS.md 管理
│   │   │   ├── claude.ts      # Claude Code 整合
│   │   │   ├── codebuddy.ts   # CodeBuddy 整合
│   │   │   └── ...            # 其他 AI 工具
│   │   ├── converters/        # 格式轉換器
│   │   ├── parsers/           # Markdown 解析器
│   │   ├── schemas/           # Zod 驗證 schemas
│   │   ├── templates/         # 模板系統（需要本地化）
│   │   ├── validation/        # 驗證系統
│   │   ├── archive.ts         # 封存功能
│   │   ├── config.ts          # 設定管理
│   │   ├── init.ts            # 初始化命令
│   │   ├── list.ts            # 列表功能
│   │   ├── update.ts          # 更新命令
│   │   └── view.ts            # 儀表板視圖
│   ├── utils/                  # 工具函式
│   └── index.ts               # 套件匯出
├── bin/                        # CLI 執行檔
│   └── openspec.js            # CLI 入口
├── dist/                       # 建置輸出（gitignore）
├── .github/                    # CI 配置（謹慎同步）
├── openspec/                   # OpenSpec 工作目錄（本專案使用）
├── openspec-upstream/          # 原版專案追蹤（.gitignore，git 倉庫）
├── CHANGELOG.md               # 版本記錄（獨立維護）
└── CLAUDE.md                  # 專案記憶檔案
```

### 檔案分類與處理策略
| 類別         | 目錄/檔案                          | 同步策略 | 本地化策略            |
| ------------ | ---------------------------------- | -------- | --------------------- |
| 核心代碼     | `src/`                             | 必須同步 | 輸出訊息需繁體       |
| 模板系統     | `src/core/templates/`              | 結構同步 | 完全繁體翻譯         |
| 配置器       | `src/core/configurators/`          | 完全同步 | AI 指令需繁體        |
| CLI 執行檔   | `bin/`                             | 完全同步 | 不翻譯               |
| CI 配置      | `.github/`                         | 謹慎同步 | 不翻譯               |
| 專案文件     | `README.md`, `docs/`               | 結構參考 | 完全繁體翻譯         |
| AGENTS.md    | `openspec/AGENTS.md`               | 結構同步 | 完全繁體翻譯         |
| 原版追蹤     | `openspec-upstream/`               | 不提交   | 原版 git 倉庫，用於追蹤原版更新 |

### 版本對應關係
- **當前版本**：v0.15.0（查看 `package.json` 中的 `version` 欄位）
- **原版版本**：v0.15.0（Git tag）
- **同步狀態**：✅ 已同步（基於原版 v0.15.0）
- **同步日期**：2025-11-18
- **核心功能**：新增 Qwen Code、Qoder、CoStrict、Gemini CLI、RooCode 支援；改進工具檢測邏輯
- **本地化狀態**：✅ 完成繁體中文本地化

### 緊急情況處理
1. **同步衝突**：優先保留原版功能，僅在本地化內容上保留修改
2. **版本不一致**：檢查 `package.json` 和 `CHANGELOG.md`
3. **功能異常**：對比原版專案，確認是否為同步問題

### 版本管理要求

**版本號單一來源原則**：
- **唯一來源**：版本號只需在 `package.json` 中維護
- **自動讀取**：CLI 從 `package.json` 動態讀取版本號
- **技術實現**：使用 ES modules 的 `createRequire` 讀取 package.json

**版本更新流程**：
- ✅ 更新 `package.json` 中的版本號和描述
- ✅ 在 `CHANGELOG.md` 中新增相應條目
- ✅ 更新 `CLAUDE.md` 版本資訊
- ✅ 同步原版更新時記錄對應的原版提交資訊
- ✅ 使用 changesets 管理版本發布（`pnpm changeset`）

---

## 技術架構

### 核心組件

#### CLI 架構 (`src/cli/index.ts`)
**主要功能**：
- 使用 `commander` 建構 CLI 介面
- 提供全域選項（如 `--no-color`）
- 整合所有命令模組

**關鍵命令**：
- `init` - 初始化 OpenSpec（支援 `--tools` 非互動模式）
- `list` - 列出變更
- `view` - 互動式儀表板
- `show` - 顯示變更詳情
- `validate` - 驗證規範格式
- `archive` - 封存已完成的變更
- `update` - 更新 AI 工具配置

#### 核心模組結構

**命令系統** (`src/commands/`)：
- `ChangeCommand` - 變更管理
- `ShowCommand` - 顯示變更詳情
- `SpecCommand` - 規範管理
- `ValidateCommand` - 格式驗證

**配置系統** (`src/core/configurators/`)：
- `AgentsConfigurator` - AGENTS.md 管理
- AI 工具配置器（Claude, CodeBuddy, Cursor, Cline 等）
- Slash 命令配置器系統

**模板系統** (`src/core/templates/`)：
- `agentsTemplate` - AGENTS.md 模板（需要本地化）
- `claudeTemplate` - Claude Code 指令模板（需要本地化）
- `clineTemplate` - Cline 規則模板（需要本地化）
- `slashCommandTemplates` - Slash 命令模板（需要本地化）
- `projectTemplate` - 專案設定模板（需要本地化）

**驗證系統** (`src/core/validation/`)：
- 使用 Zod 進行 schema 驗證
- Markdown 解析和驗證
- 規範格式檢查

### TypeScript 同步策略

#### 同步原則
**核心策略**：採用「**核心同步，介面本地化**」的策略，確保與原版功能完全對等的同時，為繁體中文使用者提供友善的母語介面。

#### 必須同步的內容
- ✅ **所有類別、介面和函式簽章**
- ✅ **核心演算法邏輯**：初始化、驗證、解析等核心流程
- ✅ **依賴函式庫和版本**：commander、chalk、ora、zod 等依賴保持同步
- ✅ **AI 助手支援**：所有 AI 助手的支援邏輯完全一致
- ✅ **建置配置**：TypeScript、vitest 等建置系統保持同步

#### 需要本地化的內容
- 📝 **品牌標識**：套件名稱、命令名稱、GitHub 儲存庫
- 📝 **CLI 輸出訊息**：錯誤訊息、狀態提示、互動介面
- 📝 **模板內容**：AGENTS.md、slash 命令、專案模板
- 📝 **說明文件**：README.md、使用說明、除錯資訊

### AI 助手支援（v0.13.0）

#### Slash Commands 支援
| 助手                   | CLI 工具       | 目錄格式                  | 命令格式 | 類型 | 版本    |
| ---------------------- | -------------- | ------------------------- | -------- | ---- | ------- |
| Claude Code            | `claude`       | `.claude/commands/`       | Markdown | CLI  | 基線    |
| CodeBuddy Code         | `codebuddy`    | `.codebuddy/commands/`    | Markdown | CLI  | v0.13.0 |
| Cursor                 | `cursor-agent` | `.cursor/commands/`       | Markdown | CLI  | 基線    |
| Cline                  | 無             | `.clinerules/`            | Markdown | IDE  | v0.13.0 |
| Crush                  | 無             | `.crush/commands/`        | Markdown | IDE  | v0.13.0 |
| Factory Droid          | 無             | `.factory/commands/`      | Markdown | IDE  | 基線    |
| OpenCode               | `opencode`     | `.opencode/commands/`     | Markdown | CLI  | 基線    |
| Kilo Code              | `kilocode`     | `.kilocode/workflows/`    | Markdown | CLI  | 基線    |
| Windsurf               | 無             | `.windsurf/workflows/`    | Markdown | IDE  | 基線    |
| Codex                  | `codex`        | `~/.codex/prompts/`       | Markdown | CLI  | 基線    |
| GitHub Copilot         | 無             | `.github/prompts/`        | Markdown | IDE  | 基線    |
| Amazon Q Developer     | `q`            | `.amazonq/prompts/`       | Markdown | CLI  | 基線    |
| Auggie (Augment CLI)   | `auggie`       | `.augment/commands/`      | Markdown | CLI  | v0.13.0 |

#### AGENTS.md 相容
以下工具透過 `openspec/AGENTS.md` 自動讀取工作流程指令：
- Amp
- Jules
- Gemini CLI
- 其他支援 AGENTS.md 慣例的工具

---

## 維護工作流程

### 版本同步策略

#### 基本原則
- **版本號**：本專案 tag 單獨迭代，不需要和原版同步
- **功能同步**：定期從上游合併，不新增新功能
- **發布節奏**：跟隨原版發布，不獨立發布新功能

#### 同步機制

**openspec-upstream 目錄工作機制**：
```
專案根目錄/
├── openspec-upstream/     # 原版專案目錄（.gitignore，完整 git 倉庫）
│   ├── .git/             # 原版 git 歷史
│   ├── src/              # 原版原始碼
│   ├── AGENTS.md         # 原版 AGENTS.md
│   ├── openspec/         # 原版的 OpenSpec 工作目錄
│   └── ...
├── openspec/             # 本專案的 OpenSpec 工作目錄
├── .gitignore            # 忽略 openspec-upstream/ 目錄
└── ...                   # 本專案檔案
```

**同步工作流程**：
1. 檢查當前版本對應的原版 tag/commit
2. 在 `openspec-upstream/` 目錄檢出對應原版版本
3. 對比分析原版變更內容
4. **關鍵步驟**：比對原版和本專案的差異，更新本地化內容
5. 根據檔案分類策略執行同步
6. 更新 CHANGELOG.md 記錄同步資訊

**原版專案設定**：
```bash
# 首次設定（在專案根目錄）
git clone https://github.com/Fission-AI/OpenSpec.git openspec-upstream

# 檢出對應版本
cd openspec-upstream
git checkout v0.13.0  # 檢出對應版本
cd ..
```

**日常同步命令**：
```bash
# 1. 查看原版最新版本
cd openspec-upstream
git fetch origin --tags
git tag -l | sort -V | tail -10

# 2. 檢出目標版本
git checkout v0.15.0  # 或其他目標版本

# 3. 比對差異（回到專案根目錄）
cd ..

# 比對 src 目錄（核心代碼）
diff -r --brief src openspec-upstream/src

# 比對特定檔案
diff src/core/templates/agentsTemplate.ts openspec-upstream/src/core/templates/agentsTemplate.ts

# 查看原版版本間的變更
cd openspec-upstream
git log v0.13.0..v0.15.0 --oneline
git diff v0.13.0..v0.15.0 -- src/

# 4. 檢查 package.json 依賴變更
diff package.json openspec-upstream/package.json
```

**快速同步檢查腳本**：
```bash
# 檢查原版是否有新版本
cd openspec-upstream && git fetch origin --tags && git tag -l | sort -V | tail -5

# 查看當前檢出的版本
git describe --tags

# 回到專案根目錄
cd ..
```

**同步檢查清單**：
每次同步原版版本時，必須檢查：
- [ ] 新增的 AI 助手支援
- [ ] CLI 命令變化
- [ ] 模板內容更新
- [ ] 驗證邏輯改動
- [ ] 配置器新增或修改
- [ ] 目錄結構變更
- [ ] 依賴套件更新

### CHANGELOG 維護

**維護原則**：
- `CHANGELOG.md` 由本專案獨立維護，不與原版同步
- 記錄每個版本同步的原版資訊和繁體中文本地化更新

**記錄格式**：
```markdown
## [0.13.0] - 2025-10-28

### 同步原版
- 同步原版 [v0.13.0](https://github.com/Fission-AI/OpenSpec/releases/tag/0.13.0)
- 對應原版提交：`668a125...`

### 繁體中文本地化更新
- 完成所有模板檔案的繁體中文翻譯
- 更新 CLI 介面為繁體中文
- 翻譯 AGENTS.md 指令

### 已知問題
- 無
```

### 繁體中文本地化標準

#### 本地化範圍

**需要完全繁體中文本地化的內容**：
- 使用者文件：`README.md`、`docs/` 目錄
- 模板系統：`src/core/templates/` 目錄下的所有模板
- AGENTS.md：專案根目錄的 `AGENTS.md` 指令檔案
- Slash 命令：各 AI 工具的 slash 命令模板
- CLI 介面：`src/` 中的輸出訊息、說明文字、錯誤訊息

**保持英文不翻譯的內容**：
- 建置腳本：`build.js`、`scripts/` 目錄（完全同步原版）
- CI 配置：`.github/` 目錄（謹慎同步，不翻譯）
- 程式碼層面：變數名稱、函式名稱、類別名稱等識別符號
- 套件名稱：`@minidoracat/openspec-tw`（保持英文）

#### 翻譯標準

**翻譯原則**：
- **使用者導向**：面向繁體中文開發者，翻譯使用者介面和文件
- **技術保留**：程式碼層面保持英文，確保技術準確性
- **功能對等**：翻譯後功能必須與原版完全一致

**術語處理**：

**不翻譯的英文術語**：
- CLI, API, JSON, YAML, Markdown
- Git, GitHub, Repository, Branch, Commit
- TypeScript, JavaScript, Node.js
- Framework, Library, Package, Dependency
- Template, Command, Argument
- AI 助手名稱：Claude Code, CodeBuddy, Cursor, Cline

**需要翻譯的概念**：
- "Spec-Driven Development" → "規範驅動開發"
- "Change Proposal" → "變更提案"
- "Requirements" → "需求"
- "Scenario" → "情境"
- "Implementation" → "實作"
- "Validation" → "驗證"
- "Archive" → "封存"

**語言風格**：
- 使用簡潔、準確的技術繁體中文
- 避免過度口語化，保持專業性
- 句式結構清晰，避免長難句
- 統一術語使用

**中英文混排規則**：
```markdown
✅ 推薦：
- 使用 OpenSpec 進行規範驅動開發
- 支援 Markdown 格式的規範檔案
- 透過 CLI 命令管理變更

❌ 避免：
- 使用OpenSpec進行規範驅動開發
- 支援 Markdown 格式的規範檔案
```

**標點符號**：
- 使用繁體中文標點（，。：；！？）
- 英文術語後使用英文標點
- 程式碼範例中使用英文標點

**品牌處理**：
- GitHub → GitHub（不翻譯）
- Claude Code → Claude Code（不翻譯）
- OpenSpec → OpenSpec（不翻譯，可加註「規範系統」）
- 版本號保持原樣（v0.13.0）

---

## 品質保證

### 翻譯品質檢查清單

翻譯完成後必須檢查：
- [ ] 術語使用是否一致
- [ ] 中英文混排是否恰當
- [ ] 技術準確性是否保持
- [ ] 語句是否通順易懂
- [ ] 格式是否統一規範
- [ ] 連結和引用是否正確
- [ ] 程式碼範例是否保持原樣
- [ ] 與原版功能是否完全一致

### 功能一致性檢查

**必須保持一致**：
- 核心功能和 API
- 專案結構和檔案組織
- 支援的 AI 助手列表
- 命令和工作流程

**允許差異**：
- 套件名稱和命令名稱（openspec-tw vs openspec）
- 文件語言（繁體中文 vs 英文）
- GitHub repository 位置
- 預設配置和選項

### 程式碼品質檢查

由於是複刻專案，重點關注：
- 測試基本功能
- 檢查模板檔案是否包含繁體中文
- 驗證 CLI 輸出是否正確本地化
- 確保同步後的功能完整性
- 執行測試套件（`pnpm test`）

---

## 附錄

### 術語表

| 英文                    | 繁體中文       | 說明                     |
| ----------------------- | -------------- | ------------------------ |
| Spec-Driven Development | 規範驅動開發   | SDD 方法論               |
| Change Proposal         | 變更提案       | 新功能或修改的提案       |
| Requirements            | 需求           | 功能需求規格             |
| Scenario                | 情境           | 使用情境或測試案例       |
| Delta                   | 差異           | 規範變更差異             |
| Archive                 | 封存           | 完成變更的封存動作       |
| Validation              | 驗證           | 規範格式驗證             |
| CLI                     | CLI            | 命令列介面（不翻譯）     |
| Slash Command           | Slash 命令     | AI 助手的斜線命令        |
| AGENTS.md               | AGENTS.md      | AI 助手指令檔（不翻譯）  |

### 檔案模板

**新版本同步記錄模板**：
```markdown
## [x.x.x] - YYYY-MM-DD

### 同步原版
- 同步原版 [v.x.x](https://github.com/Fission-AI/OpenSpec/releases/tag/x.x.x)
- 對應原版提交：`commit-hash`

### 繁體中文本地化更新
- [具體的本地化更新內容]

### 已知問題
- [已知問題和解決方案]
```

### 參考連結

- **原版專案**：[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
- **原版文件**：[OpenSpec README](https://github.com/Fission-AI/OpenSpec/blob/main/README.md)
- **GitHub Releases**：[OpenSpec releases](https://github.com/Fission-AI/OpenSpec/releases)
- **繁體版儲存庫**：[Minidoracat/OpenSpec-tw](https://github.com/Minidoracat/OpenSpec-tw)
- **npm 套件（原版）**：[@fission-ai/openspec](https://www.npmjs.com/package/@fission-ai/openspec)
- **AGENTS.md 慣例**：[agents.md](https://agents.md/)

---

## 文件維護說明

本文件是 OpenSpec TW 專案的核心記憶檔案，用於指導 Claude Code 進行專案維護。請確保：

1. **及時更新**：同步原版更新後及時更新相關內容
2. **保持準確**：所有命令、路徑、版本號必須準確
3. **結構清晰**：維護良好的文件結構，便於快速查找
4. **內容完整**：確保所有重要的維護資訊都已包含

**最後更新**：2025-10-28 - 完成專案從 spec-kit-tw 到 OpenSpec-tw 的改寫
