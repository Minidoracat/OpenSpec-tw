export type SlashCommandId = 'proposal' | 'apply' | 'archive';

const baseGuardrails = `**指導原則**
- 優先採用簡單、最小化的實作方式，僅在明確要求或必要時才增加複雜度。
- 保持變更範圍緊密聚焦於請求的結果。
- 如需額外的 OpenSpec 慣例或說明，請參考 \`openspec/AGENTS.md\`（位於 \`openspec/\` 目錄內——如果看不到，請執行 \`ls openspec\` 或 \`openspec-tw update\`）。`;

const proposalGuardrails = `${baseGuardrails}\n- 在編輯檔案前，先識別任何模糊或不明確的細節，並提出必要的後續問題。`;

const proposalSteps = `**步驟**
1. 檢視 \`openspec/project.md\`，執行 \`openspec-tw list\` 和 \`openspec-tw list --specs\`，並檢查相關程式碼或文件（例如透過 \`rg\`/\`ls\`），以基於當前行為建立提案；記錄任何需要釐清的缺漏。
2. 選擇一個唯一的動詞開頭的 \`change-id\`，並在 \`openspec/changes/<id>/\` 下建立 \`proposal.md\`、\`tasks.md\` 和 \`design.md\`（如有需要）。
3. 將變更對應到具體的功能或需求，將多範圍的工作分解為明確關聯和順序的規範差異。
4. 當解決方案跨越多個系統、引入新模式或需要在提交規範前討論權衡時，在 \`design.md\` 中記錄架構推理。
5. 在 \`changes/<id>/specs/<capability>/spec.md\` 中撰寫規範差異（每個功能一個資料夾），使用 \`## ADDED|MODIFIED|REMOVED Requirements\`，每個需求至少包含一個 \`#### Scenario:\`，情境內容必須使用 Gherkin 格式：\`- **WHEN** 動作\`、\`- **THEN** 結果\`、\`- **AND** 附加條件\`，並在相關時交叉引用相關功能。
6. 將 \`tasks.md\` 撰寫為有序的小型、可驗證工作項目清單，提供使用者可見的進度，包含驗證（測試、工具），並標示依賴或可並行的工作。
7. 使用 \`openspec-tw validate <id> --strict\` 驗證，並在分享提案前解決所有問題。`;

const proposalReferences = `**參考**
- 當驗證失敗時，使用 \`openspec-tw show <id> --json --deltas-only\` 或 \`openspec-tw show <spec> --type spec\` 檢查詳細資訊。
- 在撰寫新需求前，使用 \`rg -n "Requirement:|Scenario:" openspec/specs\` 搜尋現有需求。
- 透過 \`rg <keyword>\`、\`ls\` 或直接讀取檔案來探索程式碼庫，使提案符合當前實作現況。`;

const applySteps = `**步驟**
將這些步驟作為 TODO 追蹤，並逐一完成。
1. 閱讀 \`changes/<id>/proposal.md\`、\`design.md\`（如有）和 \`tasks.md\`，以確認範圍和驗收標準。
2. 依序執行任務，保持編輯最小化並專注於請求的變更。
3. 在更新狀態前確認完成——確保 \`tasks.md\` 中的每個項目都已完成。
4. 在所有工作完成後更新檢查清單，使每個任務都標記為 \`- [x]\` 並反映實際狀況。
5. 需要額外上下文時，參考 \`openspec-tw list\` 或 \`openspec-tw show <item>\`。`;

const applyReferences = `**參考**
- 如果在實作時需要提案的額外上下文，請使用 \`openspec-tw show <id> --json --deltas-only\`。`;

const archiveSteps = `**步驟**
1. 確定要封存的變更 ID：
   - 如果此提示已包含特定的變更 ID（例如在由 slash 命令參數填充的 \`<ChangeId>\` 區塊內），請在修剪空白後使用該值。
   - 如果對話籠統地引用了一個變更（例如透過標題或摘要），執行 \`openspec-tw list\` 以找出可能的 ID，分享相關候選項，並確認使用者的意圖。
   - 否則，檢視對話，執行 \`openspec-tw list\`，並詢問使用者要封存哪個變更；在繼續之前等待確認的變更 ID。
   - 如果仍無法識別單一變更 ID，請停止並告知使用者您尚無法封存任何內容。
2. 透過執行 \`openspec-tw list\`（或 \`openspec-tw show <id>\`）驗證變更 ID，如果變更遺失、已封存或其他方式尚未準備好封存，請停止。
3. 執行 \`openspec-tw archive <id> --yes\`，使 CLI 移動變更並應用規範更新而不提示（僅在純工具工作時使用 \`--skip-specs\`）。
4. 檢視命令輸出以確認目標規範已更新，且變更已進入 \`changes/archive/\`。
5. 使用 \`openspec-tw validate --strict\` 驗證，如有任何異常，使用 \`openspec-tw show <id>\` 檢查。`;

const archiveReferences = `**參考**
- 在封存前使用 \`openspec-tw list\` 確認變更 ID。
- 使用 \`openspec-tw list --specs\` 檢查已更新的規範，並在交接前解決任何驗證問題。`;

export const slashCommandBodies: Record<SlashCommandId, string> = {
  proposal: [proposalGuardrails, proposalSteps, proposalReferences].join('\n\n'),
  apply: [baseGuardrails, applySteps, applyReferences].join('\n\n'),
  archive: [baseGuardrails, archiveSteps, archiveReferences].join('\n\n')
};

export function getSlashCommandBody(id: SlashCommandId): string {
  return slashCommandBodies[id];
}
