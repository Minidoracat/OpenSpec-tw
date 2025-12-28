<p align="center">
  <a href="https://github.com/Minidoracat/OpenSpec-tw">
    <picture>
      <source srcset="assets/openspec_pixel_dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="assets/openspec_pixel_light.svg" media="(prefers-color-scheme: light)">
      <img src="assets/openspec_pixel_light.svg" alt="OpenSpec logo" height="64">
    </picture>
  </a>

</p>
<p align="center">專為 AI 程式設計助手設計的規範驅動開發工具。</p>
<p align="center">
  <a href="https://github.com/Minidoracat/OpenSpec-tw/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Minidoracat/OpenSpec-tw/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@minidoracat/openspec-tw"><img alt="npm version" src="https://img.shields.io/npm/v/@minidoracat/openspec-tw?style=flat-square" /></a>
  <a href="https://nodejs.org/"><img alt="node version" src="https://img.shields.io/node/v/@minidoracat/openspec-tw?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://conventionalcommits.org"><img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?logo=discord&logoColor=white&style=flat-square" /></a>
</p>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec dashboard preview" width="90%">
</p>

<p align="center">
  在 X 上關注 <a href="https://x.com/0xTab">@0xTab</a> 獲取更新 · 加入 <a href="https://discord.gg/YctCnvvshC">OpenSpec Discord</a> 尋求幫助與提問。
</p>

# OpenSpec

OpenSpec 透過規範驅動開發，讓人類和 AI 程式設計助手達成一致，讓您在撰寫任何程式碼之前就能確定要建構什麼。**無需 API 金鑰。**

## 為什麼選擇 OpenSpec？

AI 程式設計助手功能強大，但當需求存放在聊天記錄中時，結果會難以預測。OpenSpec 新增一個輕量的規範工作流程，在實作前鎖定意圖，提供可確定且可檢視的輸出。

主要優勢：
- 在工作開始前，人類和 AI 利害關係人就規範達成一致。
- 結構化的變更資料夾（提案、任務和規範更新）保持範圍明確且可稽核。
- 共享對提案、進行中或已封存內容的可見性。
- 與您已經在使用的 AI 工具協作：在支援的地方使用自訂 slash 命令，其他地方則使用情境規則。

## OpenSpec 的比較（一覽）

- **輕量化**：簡單的工作流程、無需 API 金鑰、最少的設定。
- **優先支援現有專案**：不只適用於從零開始的專案。OpenSpec 將真實來源與提案分開：`openspec/specs/`（當前真實）和 `openspec/changes/`（提議的更新）。這讓差異在功能之間保持明確且易於管理。
- **變更追蹤**：提案、任務和規範差異存放在一起；封存會將已核准的更新合併回規範。
- **與 spec-kit 和 Kiro 比較**：這些工具在全新功能（0→1）方面表現出色。OpenSpec 在修改現有行為（1→n）時也同樣出色，特別是當更新跨越多個規範時。

請參閱[OpenSpec 的比較](#openspec-的比較詳細說明)中的完整比較。

## 運作方式

```
┌────────────────────┐
│ 起草變更提案       │
│                    │
└────────┬───────────┘
         │ 與您的 AI 分享意圖
         ▼
┌────────────────────┐
│ 檢視與對齊         │
│ (編輯規範/任務)    │◀──── 回饋迴圈 ──────┐
└────────┬───────────┘                      │
         │ 已核准的計劃                     │
         ▼                                  │
┌────────────────────┐                      │
│ 實作任務           │──────────────────────┘
│ (AI 撰寫程式碼)    │
└────────┬───────────┘
         │ 交付變更
         ▼
┌────────────────────┐
│ 封存並更新         │
│ 規範（來源）       │
└────────────────────┘

1. 起草一個變更提案，捕捉您想要的規範更新。
2. 與您的 AI 助手檢視提案，直到所有人都同意。
3. 實作參考已同意規範的任務。
4. 封存變更，將已核准的更新合併回真實來源規範。
```

## 開始使用

### 支援的 AI 工具

<details>
<summary><strong>原生 Slash 命令</strong>（點擊展開）</summary>

這些工具內建 OpenSpec 命令。在提示時選擇 OpenSpec 整合。

| 工具 | 命令 |
|------|----------|
| **Amazon Q Developer** | `@openspec-proposal`、`@openspec-apply`、`@openspec-archive`（`.amazonq/prompts/`） |
| **Antigravity** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.agent/workflows/`） |
| **Auggie (Augment CLI)** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.augment/commands/`） |
| **Claude Code** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive` |
| **Cline** | `.clinerules/workflows/` 目錄中的工作流程（`.clinerules/workflows/openspec-*.md`） |
| **CodeBuddy Code (CLI)** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（`.codebuddy/commands/`）— 請參閱[文件](https://www.codebuddy.ai/cli) |
| **Codex** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（全域：`~/.codex/prompts`，自動安裝） |
| **CoStrict** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.cospec/openspec/commands/`）— 請參閱[文件](https://costrict.ai) |
| **Crush** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.crush/commands/openspec/`） |
| **Cursor** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive` |
| **Factory Droid** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.factory/commands/`） |
| **Gemini CLI** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（`.gemini/commands/openspec/`） |
| **GitHub Copilot** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.github/prompts/`） |
| **iFlow (iflow-cli)** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.iflow/commands/`） |
| **Kilo Code** | `/openspec-proposal.md`、`/openspec-apply.md`、`/openspec-archive.md`（`.kilocode/workflows/`） |
| **OpenCode** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive` |
| **Qoder (CLI)** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（`.qoder/commands/openspec/`）— 請參閱[文件](https://qoder.com/cli) |
| **Qwen Code** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.qwen/commands/`） |
| **RooCode** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.roo/commands/`） |
| **Windsurf** | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（`.windsurf/workflows/`） |

Kilo Code 會自動發現團隊工作流程。將產生的檔案儲存在 `.kilocode/workflows/` 下，並使用 `/openspec-proposal.md`、`/openspec-apply.md` 或 `/openspec-archive.md` 從命令面板觸發它們。

</details>

<details>
<summary><strong>AGENTS.md 相容</strong>（點擊展開）</summary>

這些工具會自動從 `openspec/AGENTS.md` 讀取工作流程指令。如果需要提醒，請要求它們遵循 OpenSpec 工作流程。深入了解 [AGENTS.md 慣例](https://agents.md/)。

| 工具 |
|-------|
| Amp • Jules • 其他 |

</details>

### 安裝與初始化

#### 前置需求
- **Node.js >= 20.19.0** - 使用 `node --version` 檢查您的版本

#### 步驟 1：全域安裝 CLI

```bash
npm install -g @minidoracat/openspec-tw@latest
```

驗證安裝：
```bash
openspec-tw --version
```

#### 步驟 2：在專案中初始化 OpenSpec

導航至您的專案目錄：
```bash
cd my-project
```

執行初始化：
```bash
openspec-tw init
```

**初始化期間會發生什麼：**
- 系統會提示您選擇任何原生支援的 AI 工具（Claude Code、CodeBuddy、Cursor、OpenCode 等）；其他助手始終依賴共享的 `AGENTS.md` 存根
- OpenSpec 會自動為您選擇的工具配置 slash 命令，並始終在專案根目錄寫入一個受管理的 `AGENTS.md` 交接檔
- 在您的專案中建立一個新的 `openspec/` 目錄結構

**設定後：**
- 主要 AI 工具可以在無需額外配置的情況下觸發 `/openspec` 工作流程
- 執行 `openspec-tw list` 以驗證設定並檢視任何活動變更
- 如果您的程式設計助手沒有立即顯示新的 slash 命令，請重新啟動它。Slash 命令在啟動時載入，因此重新啟動可確保它們出現

### 選擇性：填充專案情境

`openspec-tw init` 完成後，您將收到一個建議的提示，以幫助填充您的專案情境：

```text
填充您的專案情境：
「請閱讀 openspec/project.md 並幫助我填寫有關我的專案、技術堆疊和慣例的詳細資訊」
```

使用 `openspec/project.md` 定義專案層級的慣例、標準、架構模式以及其他應在所有變更中遵循的指南。

### 建立您的第一個變更

這是一個完整的 OpenSpec 工作流程真實範例。這適用於任何 AI 工具。具有原生 slash 命令的工具會自動識別快捷方式。

#### 1. 起草提案
首先要求您的 AI 建立一個變更提案：

```text
您：建立一個 OpenSpec 變更提案，用於依角色和團隊新增個人資料搜尋篩選器
    （具有 slash 命令的工具的快捷方式：/openspec:proposal 新增個人資料搜尋篩選器）

AI：我將為個人資料篩選器建立一個 OpenSpec 變更提案。
    *使用 proposal.md、tasks.md、規範差異建構 openspec/changes/add-profile-filters/*
```

#### 2. 驗證與檢視
檢查變更是否正確建立並檢視提案：

```bash
$ openspec-tw list                             # 確認變更資料夾存在
$ openspec-tw validate add-profile-filters     # 驗證規範格式
$ openspec-tw show add-profile-filters         # 檢視提案、任務和規範差異
```

#### 3. 優化規範
迭代規範，直到它們符合您的需求：

```text
您：您能為角色和團隊篩選器新增驗收標準嗎？

AI：我將使用角色和團隊篩選器的情境更新規範差異。
    *編輯 openspec/changes/add-profile-filters/specs/profile/spec.md 和 tasks.md*
```

#### 4. 實作變更
一旦規範看起來不錯，開始實作：

```text
您：規範看起來不錯。讓我們實作這個變更。
    （具有 slash 命令的工具的快捷方式：/openspec:apply add-profile-filters）

AI：我將處理 add-profile-filters 變更中的任務。
    *實作來自 openspec/changes/add-profile-filters/tasks.md 的任務*
    *標記任務為完成：任務 1.1 ✓、任務 1.2 ✓、任務 2.1 ✓...*
```

#### 5. 封存已完成的變更
實作完成後，封存變更：

```text
AI：所有任務都已完成。實作已就緒。

您：請封存變更
    （具有 slash 命令的工具的快捷方式：/openspec:archive add-profile-filters）

AI：我將封存 add-profile-filters 變更。
   *執行：openspec-tw archive add-profile-filters --yes*
    ✓ 變更已成功封存。規範已更新。準備好進行下一個功能！
```

或在終端機中自行執行命令：
```bash
$ openspec-tw archive add-profile-filters --yes  # 無提示封存已完成的變更
```

**注意：** 具有原生 slash 命令的工具（Claude Code、CodeBuddy、Cursor、Codex）可以使用所示的快捷方式。所有其他工具都可以使用自然語言請求「建立 OpenSpec 提案」、「應用 OpenSpec 變更」或「封存變更」。

## 命令參考

```bash
openspec-tw list               # 檢視活動變更資料夾
openspec-tw view               # 規範和變更的互動式儀表板
openspec-tw show <change>      # 顯示變更詳情（提案、任務、規範更新）
openspec-tw validate <change>  # 檢查規範格式和結構
openspec-tw archive <change> [--yes|-y]   # 將已完成的變更移至 archive/（使用 --yes 為非互動式）

# 配置管理（v0.17.0+）
openspec-tw config path        # 顯示配置檔案位置
openspec-tw config list        # 列出所有設定
openspec-tw config get <key>   # 取得特定值
openspec-tw config set <key> <value>  # 設定值
openspec-tw config unset <key> # 移除設定
openspec-tw config reset --all # 重設為預設值
openspec-tw config edit        # 用 $EDITOR 編輯配置

# Shell 自動補全（v0.17.0+，目前支援 Zsh）
openspec-tw completion generate [shell]   # 生成補全腳本
openspec-tw completion install [shell]    # 安裝補全
openspec-tw completion uninstall [shell]  # 解除安裝補全
```

## 範例：AI 如何建立 OpenSpec 檔案

當您要求 AI 助手「新增雙因素驗證」時，它會建立：

```
openspec/
├── specs/
│   └── auth/
│       └── spec.md           # 當前驗證規範（如果存在）
└── changes/
    └── add-2fa/              # AI 建立整個結構
        ├── proposal.md       # 為什麼以及哪些變更
        ├── tasks.md          # 實作清單
        ├── design.md         # 技術決策（選擇性）
        └── specs/
            └── auth/
                └── spec.md   # 顯示新增內容的差異
```

### AI 產生的規範（建立於 `openspec/specs/auth/spec.md`）：

```markdown
# 驗證規範

## 目的
驗證和工作階段管理。

## 需求
### 需求：使用者驗證
系統應在成功登入時發出 JWT。

#### 情境：有效憑證
- 當使用者提交有效憑證時
- 則傳回 JWT
```

### AI 產生的變更差異（建立於 `openspec/changes/add-2fa/specs/auth/spec.md`）：

```markdown
# 驗證差異

## 已新增的需求
### 需求：雙因素驗證
系統必須在登入期間要求第二個因素。

#### 情境：需要 OTP
- 當使用者提交有效憑證時
- 則需要 OTP 挑戰
```

### AI 產生的任務（建立於 `openspec/changes/add-2fa/tasks.md`）：

```markdown
## 1. 資料庫設定
- [ ] 1.1 將 OTP 密鑰欄位新增至使用者表
- [ ] 1.2 建立 OTP 驗證日誌表

## 2. 後端實作
- [ ] 2.1 新增 OTP 產生端點
- [ ] 2.2 修改登入流程以要求 OTP
- [ ] 2.3 新增 OTP 驗證端點

## 3. 前端更新
- [ ] 3.1 建立 OTP 輸入元件
- [ ] 3.2 更新登入流程 UI
```

**重要：** 您不需要手動建立這些檔案。您的 AI 助手會根據您的需求和現有程式碼庫產生它們。

## 了解 OpenSpec 檔案

### 差異格式

差異是顯示規範如何變更的「補丁」：

- **`## 已新增的需求`** - 新功能
- **`## 已修改的需求`** - 變更的行為（包含完整更新的文字）
- **`## 已移除的需求`** - 已棄用的功能

**格式要求：**
- 使用 `### 需求：<名稱>` 作為標題
- 每個需求至少需要一個 `#### 情境：` 區塊
- 在需求文字中使用「應」或「必須」

## OpenSpec 的比較（詳細說明）

### 與 spec-kit 比較
OpenSpec 的雙資料夾模型（`openspec/specs/` 用於當前真實，`openspec/changes/` 用於提議的更新）將狀態和差異分開。這在您修改現有功能或觸及多個規範時具有可擴展性。spec-kit 在全新/0→1 專案方面表現出色，但對於跨規範更新和演進功能提供的結構較少。

### 與 Kiro.dev 比較
OpenSpec 將功能的每個變更分組在一個資料夾中（`openspec/changes/feature-name/`），使得追蹤相關規範、任務和設計變得容易。Kiro 將更新分散在多個規範資料夾中，這可能使功能追蹤更加困難。

### 與無規範比較
沒有規範時，AI 程式設計助手會根據模糊的提示產生程式碼，通常會遺漏需求或新增不需要的功能。OpenSpec 透過在撰寫任何程式碼之前就所需行為達成一致，帶來可預測性。

## 團隊採用

1. **初始化 OpenSpec** – 在您的儲存庫中執行 `openspec-tw init`。
2. **從新功能開始** – 要求您的 AI 將即將進行的工作捕捉為變更提案。
3. **逐步成長** – 每個變更都會封存到記錄系統的活文件規範中。
4. **保持靈活性** – 不同的團隊成員可以使用 Claude Code、CodeBuddy、Cursor 或任何 AGENTS.md 相容工具，同時共享相同的規範。

每當有人切換工具時執行 `openspec-tw update`，以便您的代理程式獲取最新的指令和 slash 命令綁定。

## 更新 OpenSpec

1. **升級套件**
   ```bash
   npm install -g @minidoracat/openspec-tw@latest
   ```
2. **更新代理指令**
   - 在每個專案中執行 `openspec-tw update` 以重新產生 AI 指引並確保最新的 slash 命令處於活動狀態。

## 貢獻

- 安裝依賴項：`pnpm install`
- 建置：`pnpm run build`
- 測試：`pnpm test`
- 本地開發 CLI：`pnpm run dev` 或 `pnpm run dev:cli`
- 傳統提交（單行）：`type(scope): subject`

## 授權

MIT
