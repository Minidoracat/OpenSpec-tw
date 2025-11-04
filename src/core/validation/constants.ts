/**
 * Validation threshold constants
 */

// Minimum character lengths
export const MIN_WHY_SECTION_LENGTH = 50;
export const MIN_PURPOSE_LENGTH = 50;

// Maximum character/item limits
export const MAX_WHY_SECTION_LENGTH = 1000;
export const MAX_REQUIREMENT_TEXT_LENGTH = 500;
export const MAX_DELTAS_PER_CHANGE = 10;

// 驗證訊息
export const VALIDATION_MESSAGES = {
  // 必要內容
  SCENARIO_EMPTY: '情境文字不可為空',
  REQUIREMENT_EMPTY: '需求文字不可為空',
  REQUIREMENT_NO_SHALL: '需求必須包含 SHALL 或 MUST 關鍵字',
  REQUIREMENT_NO_SCENARIOS: '需求必須至少有一個情境',
  SPEC_NAME_EMPTY: '規範名稱不可為空',
  SPEC_PURPOSE_EMPTY: '目的區段不可為空',
  SPEC_NO_REQUIREMENTS: '規範必須至少有一個需求',
  CHANGE_NAME_EMPTY: '變更名稱不可為空',
  CHANGE_WHY_TOO_SHORT: `為什麼區段必須至少 ${MIN_WHY_SECTION_LENGTH} 個字元`,
  CHANGE_WHY_TOO_LONG: `為什麼區段不應超過 ${MAX_WHY_SECTION_LENGTH} 個字元`,
  CHANGE_WHAT_EMPTY: '變更內容區段不可為空',
  CHANGE_NO_DELTAS: '變更必須至少有一個差異',
  CHANGE_TOO_MANY_DELTAS: `考慮拆分超過 ${MAX_DELTAS_PER_CHANGE} 個差異的變更`,
  DELTA_SPEC_EMPTY: '規範名稱不可為空',
  DELTA_DESCRIPTION_EMPTY: '差異描述不可為空',

  // 警告
  PURPOSE_TOO_BRIEF: `目的區段過於簡短（少於 ${MIN_PURPOSE_LENGTH} 個字元）`,
  REQUIREMENT_TOO_LONG: `需求文字過長（>${MAX_REQUIREMENT_TEXT_LENGTH} 個字元）。考慮拆分。`,
  DELTA_DESCRIPTION_TOO_BRIEF: '差異描述過於簡短',
  DELTA_MISSING_REQUIREMENTS: '差異應包含需求',

  // 指引片段（附加到主要訊息以提供補救方法）
  GUIDE_NO_DELTAS:
    '找不到差異。請確保您的變更有一個 specs/ 目錄，其中包含功能資料夾（例如 specs/http-server/spec.md），這些資料夾包含使用差異標題（## 新增需求/修改需求/移除需求/重新命名需求 或英文 ## ADDED/MODIFIED/REMOVED/RENAMED Requirements）的 .md 檔案，並且每個需求至少包含一個 "#### 情境：" 或 "#### Scenario:" 區塊。提示：執行 "openspec-tw change show <change-id> --json --deltas-only" 來檢查已解析的差異。',
  GUIDE_MISSING_SPEC_SECTIONS:
    '缺少必要區段。預期的標題：「## 目的」和「## 需求」（或英文 "## Purpose" 和 "## Requirements"）。範例：\n## 目的\n[簡要目的]\n\n## 需求\n### 需求：清楚的需求陳述\n使用者 SHALL ...\n\n#### 情境：描述性名稱\n- **WHEN** ...\n- **THEN** ...',
  GUIDE_MISSING_CHANGE_SECTIONS:
    '缺少必要區段。預期的標題：「## 為什麼」和「## 變更內容」（或英文 "## Why" 和 "## What Changes"）。請確保在 specs/ 中使用差異標題記錄差異。',
  GUIDE_SCENARIO_FORMAT:
    '情境必須使用第四級標題。將項目符號列表轉換為：\n#### 情境：簡短名稱\n- **WHEN** ...\n- **THEN** ...\n- **AND** ...',
} as const;
