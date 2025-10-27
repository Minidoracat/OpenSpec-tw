# OpenSpec 指令

給使用 OpenSpec 進行規範驅動開發的 AI 編碼助手的指令。

## TL;DR 快速檢查清單

- 搜尋現有工作：`openspec-tw spec list --long`、`openspec-tw list`（僅在全文搜尋時使用 `rg`）
- 決定範圍：新增能力 vs 修改現有能力
- 選擇唯一的 `change-id`：kebab-case、動詞開頭（`add-`、`update-`、`remove-`、`refactor-`）
- 建立腳手架：`proposal.md`、`tasks.md`、`design.md`（僅在需要時）、以及每個受影響能力的差異規範
- 撰寫差異：使用 `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`；每個需求至少包含一個 `#### Scenario:`
- 驗證：`openspec-tw validate [change-id] --strict` 並修正問題
- 請求核准：在提案獲得核准之前不要開始實作

## 三階段工作流程

### 階段 1：建立變更

在以下情況建立提案：
- 新增功能或特性
- 進行破壞性變更（API、schema）
- 變更架構或模式
- 最佳化效能（變更行為）
- 更新安全性模式

觸發條件（範例）：
- 「協助我建立變更提案」
- 「協助我規劃變更」
- 「協助我建立提案」
- 「我想建立規範提案」
- 「我想建立規範」

寬鬆比對指引：
- 包含其中之一：`proposal`、`change`、`spec`
- 搭配其中之一：`create`、`plan`、`make`、`start`、`help`

跳過提案的情況：
- Bug 修復（恢復預期行為）
- 錯字、格式、註解
- 依賴更新（非破壞性）
- 配置變更
- 現有行為的測試

**工作流程**
1. 檢視 `openspec/project.md`、`openspec-tw list` 和 `openspec-tw list --specs` 以了解當前脈絡。
2. 選擇唯一的動詞開頭 `change-id`，並在 `openspec/changes/<id>/` 下建立 `proposal.md`、`tasks.md`、選用的 `design.md` 和規範差異。
3. 使用 `## ADDED|MODIFIED|REMOVED Requirements` 起草規範差異，每個需求至少包含一個 `#### Scenario:`。
4. 執行 `openspec-tw validate <id> --strict` 並在分享提案前解決所有問題。

### 階段 2：實作變更
將這些步驟作為 TODO 追蹤並逐一完成。
1. **閱讀 proposal.md** - 了解要建構的內容
2. **閱讀 design.md**（如果存在）- 檢視技術決策
3. **閱讀 tasks.md** - 取得實作檢查清單
4. **依序實作任務** - 按順序完成
5. **確認完成** - 確保 `tasks.md` 中的每個項目都已完成，再更新狀態
6. **更新檢查清單** - 在所有工作完成後，將每個任務設為 `- [x]`，讓清單反映現實
7. **核准關卡** - 在提案經過審查並核准之前不要開始實作

### 階段 3：封存變更
部署後，建立獨立的 PR 以：
- 移動 `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
- 如果能力有變更，更新 `specs/`
- 對於僅工具相關的變更，使用 `openspec-tw archive <change-id> --skip-specs --yes`（務必明確傳遞 change ID）
- 執行 `openspec-tw validate --strict` 以確認封存的變更通過檢查

## 任何任務前

**脈絡檢查清單：**
- [ ] 閱讀 `specs/[capability]/spec.md` 中的相關規範
- [ ] 檢查 `changes/` 中的待處理變更以避免衝突
- [ ] 閱讀 `openspec/project.md` 了解慣例
- [ ] 執行 `openspec-tw list` 查看活躍的變更
- [ ] 執行 `openspec-tw list --specs` 查看現有的能力

**建立規範前：**
- 務必檢查能力是否已存在
- 優先修改現有規範而非建立重複項
- 使用 `openspec-tw show [spec]` 檢視當前狀態
- 如果請求不明確，在建立腳手架前詢問 1-2 個澄清問題

### 搜尋指引
- 列舉規範：`openspec-tw spec list --long`（或用於腳本的 `--json`）
- 列舉變更：`openspec-tw list`（或 `openspec-tw change list --json` - 已棄用但可用）
- 顯示詳情：
  - 規範：`openspec-tw show <spec-id> --type spec`（使用 `--json` 進行過濾）
  - 變更：`openspec-tw show <change-id> --json --deltas-only`
- 全文搜尋（使用 ripgrep）：`rg -n "Requirement:|Scenario:" openspec/specs`

## 快速開始

### CLI 命令

```bash
# 基本命令
openspec-tw list                  # 列出活躍的變更
openspec-tw list --specs          # 列出規範
openspec-tw show [item]           # 顯示變更或規範
openspec-tw validate [item]       # 驗證變更或規範
openspec-tw archive <change-id> [--yes|-y]   # 部署後封存（加上 --yes 進行非互動式執行）

# 專案管理
openspec-tw init [path]           # 初始化 OpenSpec
openspec-tw update [path]         # 更新指令檔案

# 互動模式
openspec-tw show                  # 提示選擇
openspec-tw validate              # 批次驗證模式

# 除錯
openspec-tw show [change] --json --deltas-only
openspec-tw validate [change] --strict
```

### 命令旗標

- `--json` - 機器可讀輸出
- `--type change|spec` - 消除項目歧義
- `--strict` - 全面驗證
- `--no-interactive` - 停用提示
- `--skip-specs` - 封存時不更新規範
- `--yes`/`-y` - 跳過確認提示（非互動式封存）

## 目錄結構

```
openspec/
├── project.md              # 專案慣例
├── specs/                  # 當前真相 - 已建構的內容
│   └── [capability]/       # 單一專注的能力
│       ├── spec.md         # 需求和情境
│       └── design.md       # 技術模式
├── changes/                # 提案 - 應該變更的內容
│   ├── [change-name]/
│   │   ├── proposal.md     # 為什麼、什麼、影響
│   │   ├── tasks.md        # 實作檢查清單
│   │   ├── design.md       # 技術決策（選用；參見準則）
│   │   └── specs/          # 差異變更
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   └── archive/            # 已完成的變更
```

## 建立變更提案

### 決策樹

```
新請求？
├─ 恢復規範行為的 Bug 修復？→ 直接修復
├─ 錯字/格式/註解？→ 直接修復
├─ 新功能/能力？→ 建立提案
├─ 破壞性變更？→ 建立提案
├─ 架構變更？→ 建立提案
└─ 不確定？→ 建立提案（較安全）
```

### 提案結構

1. **建立目錄：** `changes/[change-id]/`（kebab-case、動詞開頭、唯一）

2. **撰寫 proposal.md：**
```markdown
## Why
[關於問題/機會的 1-2 句描述]

## What Changes
- [變更的條列清單]
- [用 **BREAKING** 標示破壞性變更]

## Impact
- 受影響的規範：[列出能力]
- 受影響的程式碼：[關鍵檔案/系統]
```

3. **建立規範差異：** `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: 新功能
系統必須提供...

#### Scenario: 成功情境
- **WHEN** 使用者執行動作
- **THEN** 預期結果

## MODIFIED Requirements
### Requirement: 現有功能
[完整的修改需求]

## REMOVED Requirements
### Requirement: 舊功能
**Reason**: [為何移除]
**Migration**: [如何處理]
```
如果影響多個能力，在 `changes/[change-id]/specs/<capability>/spec.md` 下建立多個差異檔案 - 每個能力一個。

4. **建立 tasks.md：**
```markdown
## 1. Implementation
- [ ] 1.1 建立資料庫 schema
- [ ] 1.2 實作 API 端點
- [ ] 1.3 新增前端元件
- [ ] 1.4 撰寫測試
```

5. **在需要時建立 design.md：**
如果符合以下任一條件，建立 `design.md`；否則省略：
- 跨領域變更（多個服務/模組）或新的架構模式
- 新的外部依賴或重大資料模型變更
- 安全性、效能或遷移複雜性
- 在編碼前從技術決策中受益的模糊性

最小的 `design.md` 架構：
```markdown
## Context
[背景、限制、利害關係人]

## Goals / Non-Goals
- 目標：[...]
- 非目標：[...]

## Decisions
- 決策：[什麼和為什麼]
- 考慮的替代方案：[選項 + 理由]

## Risks / Trade-offs
- [風險] → 緩解措施

## Migration Plan
[步驟、回滾]

## Open Questions
- [...]
```

## 規範檔案格式

### 關鍵：情境格式

**正確**（使用 #### 標題）：
```markdown
#### Scenario: 使用者登入成功
- **WHEN** 提供有效憑證
- **THEN** 返回 JWT token
```

**錯誤**（不要使用條列或粗體）：
```markdown
- **Scenario: 使用者登入**  ❌
**Scenario**: 使用者登入     ❌
### Scenario: 使用者登入      ❌
```

每個需求必須至少有一個情境。

### 需求措辭
- 對於規範性需求使用 SHALL/MUST（除非刻意為非規範性，否則避免 should/may）

### 差異操作

- `## ADDED Requirements` - 新能力
- `## MODIFIED Requirements` - 變更的行為
- `## REMOVED Requirements` - 棄用的功能
- `## RENAMED Requirements` - 名稱變更

標題使用 `trim(header)` 比對 - 忽略空白。

#### 何時使用 ADDED vs MODIFIED
- ADDED：引入可以獨立作為需求的新能力或子能力。當變更是正交的（例如，新增「Slash 命令配置」）而非改變現有需求的語義時，優先使用 ADDED。
- MODIFIED：變更現有需求的行為、範圍或驗收標準。務必貼上完整、更新的需求內容（標題 + 所有情境）。封存器會用你在此提供的內容替換整個需求；部分差異會遺失先前的細節。
- RENAMED：僅在名稱變更時使用。如果同時變更行為，使用 RENAMED（名稱）加上 MODIFIED（內容）引用新名稱。

常見陷阱：使用 MODIFIED 新增新關注點但未包含先前文字。這會在封存時造成細節遺失。如果你並非明確變更現有需求，改為在 ADDED 下新增新需求。

正確撰寫 MODIFIED 需求：
1) 在 `openspec/specs/<capability>/spec.md` 中找到現有需求。
2) 複製整個需求區塊（從 `### Requirement: ...` 到其情境）。
3) 將其貼在 `## MODIFIED Requirements` 下並編輯以反映新行為。
4) 確保標題文字完全吻合（忽略空白）並保留至少一個 `#### Scenario:`。

RENAMED 範例：
```markdown
## RENAMED Requirements
- FROM: `### Requirement: Login`
- TO: `### Requirement: User Authentication`
```

## 疑難排解

### 常見錯誤

**「變更必須至少有一個差異」**
- 檢查 `changes/[name]/specs/` 是否存在 .md 檔案
- 驗證檔案有操作前綴（## ADDED Requirements）

**「需求必須至少有一個情境」**
- 檢查情境使用 `#### Scenario:` 格式（4 個井號）
- 不要對情境標題使用條列或粗體

**情境解析無聲失敗**
- 需要精確格式：`#### Scenario: Name`
- 使用除錯：`openspec-tw show [change] --json --deltas-only`

### 驗證技巧

```bash
# 務必使用嚴格模式進行全面檢查
openspec-tw validate [change] --strict

# 除錯差異解析
openspec-tw show [change] --json | jq '.deltas'

# 檢查特定需求
openspec-tw show [spec] --json -r 1
```

## 成功路徑腳本

```bash
# 1) 探索當前狀態
openspec-tw spec list --long
openspec-tw list
# 選用全文搜尋：
# rg -n "Requirement:|Scenario:" openspec/specs
# rg -n "^#|Requirement:" openspec/changes

# 2) 選擇 change id 並建立腳手架
CHANGE=add-two-factor-auth
mkdir -p openspec/changes/$CHANGE/{specs/auth}
printf "## Why\n...\n\n## What Changes\n- ...\n\n## Impact\n- ...\n" > openspec/changes/$CHANGE/proposal.md
printf "## 1. Implementation\n- [ ] 1.1 ...\n" > openspec/changes/$CHANGE/tasks.md

# 3) 新增差異（範例）
cat > openspec/changes/$CHANGE/specs/auth/spec.md << 'EOF'
## ADDED Requirements
### Requirement: Two-Factor Authentication
使用者必須在登入時提供第二因素。

#### Scenario: 需要 OTP
- **WHEN** 提供有效憑證
- **THEN** 需要 OTP 挑戰
EOF

# 4) 驗證
openspec-tw validate $CHANGE --strict
```

## 多能力範例

```
openspec/changes/add-2fa-notify/
├── proposal.md
├── tasks.md
└── specs/
    ├── auth/
    │   └── spec.md   # ADDED: Two-Factor Authentication
    └── notifications/
        └── spec.md   # ADDED: OTP email notification
```

auth/spec.md
```markdown
## ADDED Requirements
### Requirement: Two-Factor Authentication
...
```

notifications/spec.md
```markdown
## ADDED Requirements
### Requirement: OTP Email Notification
...
```

## 最佳實踐

### 簡單優先
- 預設 <100 行新程式碼
- 單檔案實作，直到證明不足
- 沒有明確理由不使用框架
- 選擇無聊、經過驗證的模式

### 複雜性觸發條件
僅在以下情況新增複雜性：
- 效能資料顯示當前解決方案太慢
- 具體的規模需求（>1000 使用者、>100MB 資料）
- 需要抽象化的多個經過驗證的使用案例

### 清晰的參考
- 使用 `file.ts:42` 格式表示程式碼位置
- 將規範引用為 `specs/auth/spec.md`
- 連結相關變更和 PR

### 能力命名
- 使用動詞-名詞：`user-auth`、`payment-capture`
- 每個能力單一目的
- 10 分鐘可理解性規則
- 如果描述需要「AND」則拆分

### Change ID 命名
- 使用 kebab-case、簡短且描述性：`add-two-factor-auth`
- 優先使用動詞開頭前綴：`add-`、`update-`、`remove-`、`refactor-`
- 確保唯一性；如果已被使用，附加 `-2`、`-3` 等

## 工具選擇指南

| 任務               | 工具 | 原因                 |
| ------------------ | ---- | -------------------- |
| 依模式尋找檔案     | Glob | 快速模式比對         |
| 搜尋程式碼內容     | Grep | 最佳化的正則表達式搜尋 |
| 讀取特定檔案       | Read | 直接檔案存取         |
| 探索未知範圍       | Task | 多步驟調查           |

## 錯誤復原

### 變更衝突
1. 執行 `openspec-tw list` 查看活躍的變更
2. 檢查重疊的規範
3. 與變更擁有者協調
4. 考慮合併提案

### 驗證失敗
1. 使用 `--strict` 旗標執行
2. 檢查 JSON 輸出取得詳情
3. 驗證規範檔案格式
4. 確保情境正確格式化

### 缺少脈絡
1. 先閱讀 project.md
2. 檢查相關規範
3. 檢視最近的封存
4. 要求澄清

## 快速參考

### 階段指標
- `changes/` - 已提案，尚未建構
- `specs/` - 已建構和部署
- `archive/` - 已完成的變更

### 檔案用途
- `proposal.md` - 為什麼和什麼
- `tasks.md` - 實作步驟
- `design.md` - 技術決策
- `spec.md` - 需求和行為

### CLI 基本指令
```bash
openspec-tw list              # 進行中的內容？
openspec-tw show [item]       # 檢視詳情
openspec-tw validate --strict # 是否正確？
openspec-tw archive <change-id> [--yes|-y]  # 標記完成（加上 --yes 進行自動化）
```

記住：規範是真相。變更是提案。保持它們同步。
