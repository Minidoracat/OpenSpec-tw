---
"@minidoracat/openspec-tw": minor
---

同步原版 v0.17.2

**新增功能：**
- `openspec-tw config` 命令 - 全域配置管理（XDG 支援）
  - `config path` - 顯示配置檔案位置
  - `config list` - 列出所有設定
  - `config get/set/unset` - 讀寫配置值
  - `config reset` - 重設為預設值
  - `config edit` - 用 $EDITOR 編輯
- Shell Completions 系統 - Zsh 自動補全（Oh-my-zsh 整合）
  - `completion generate [shell]` - 生成補全腳本
  - `completion install [shell]` - 安裝補全
  - `completion uninstall [shell]` - 解除安裝

**Bug 修復：**
- 修復 `--no-interactive` 在 validate 命令的問題
- 修復 pre-commit hooks 掛起問題（動態導入 @inquirer/prompts）

**測試修復：**
- 修復 Windows 環境測試相容性問題
