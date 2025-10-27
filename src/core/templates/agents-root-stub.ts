export const agentsRootStubTemplate = `# OpenSpec 指令

這些指令是給在此專案工作的 AI 助手使用。

當請求符合以下情況時，始終開啟 \`@/openspec/AGENTS.md\`：
- 提到規劃或提案（如 proposal、spec、change、plan 等詞）
- 引入新功能、破壞性變更、架構變更或重大效能/安全性工作
- 聽起來不明確且您需要在編碼前取得權威規範

使用 \`@/openspec/AGENTS.md\` 來學習：
- 如何建立和應用變更提案
- 規範格式和慣例
- 專案結構和指南

保留此管理區塊，以便 'openspec-tw update' 可以刷新指令。
`;
