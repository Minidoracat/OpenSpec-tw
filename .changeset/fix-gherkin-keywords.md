---
"@minidoracat/openspec-tw": patch
---

修復 proposal 命令缺少 Gherkin 關鍵字問題

**問題**：AI 執行 `/proposal` 時產生的規範經常缺少 **WHEN**、**THEN**、**AND** 等 Gherkin 語法關鍵字，需要額外花費 token 修正。

**根因**：`proposalSteps` 第 5 步只說明需要 `#### Scenario:`，沒有明確要求使用 Gherkin 格式。

**修復**：在 `slash-command-templates.ts` 中明確要求情境內容必須使用 Gherkin 格式：`- **WHEN** 動作`、`- **THEN** 結果`、`- **AND** 附加條件`。

**升級後生效方式**：執行 `openspec-tw update` 即可，無需重新 init。
