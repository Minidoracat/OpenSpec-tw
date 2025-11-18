---
"@minidoracat/openspec-tw": minor
---

同步原版 v0.15.0，新增 Qwen Code、Qoder、CoStrict、Gemini CLI、RooCode 支援

**新增 AI 助手支援**：
- Qwen Code - 通義千問代碼助手
- Qoder CLI - Qoder 命令列工具
- CoStrict - 程式碼約束檢查工具
- Gemini CLI - Google Gemini 命令列工具（TOML 格式）
- RooCode - 智能代碼助手

**核心改進**：
- 修正 Cline slash 命令路徑：.clinerules/ → .clinerules/workflows/
- 改進工具配置檢測邏輯，使用 OpenSpec markers 驗證
- Extend 模式下自動重建遺失的檔案
- 優化並行檢查效能
- 修正 change-id 作為備用標題（取代 Untitled Change）

**依賴更新**：
- TypeScript: 5.9.2 → 5.9.3

**完整的繁體中文本地化**：
- 所有使用者介面保持繁體中文
- 核心邏輯與原版完全一致

