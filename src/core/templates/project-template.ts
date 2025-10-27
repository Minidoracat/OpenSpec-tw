export interface ProjectContext {
  projectName?: string;
  description?: string;
  techStack?: string[];
  conventions?: string;
}

export const projectTemplate = (context: ProjectContext = {}) => `# ${context.projectName || 'Project'} 脈絡

## 目的
${context.description || '[描述您的專案目的和目標]'}

## 技術堆疊
${context.techStack?.length ? context.techStack.map(tech => `- ${tech}`).join('\n') : '- [列出您的主要技術]\n- [例如：TypeScript、React、Node.js]'}

## 專案慣例

### 程式碼風格
[描述您的程式碼風格偏好、格式規則和命名慣例]

### 架構模式
[記錄您的架構決策和模式]

### 測試策略
[說明您的測試方法和需求]

### Git 工作流程
[描述您的分支策略和提交慣例]

## 領域脈絡
[新增 AI 助手需要了解的領域特定知識]

## 重要限制
[列出任何技術、業務或法規限制]

## 外部相依性
[記錄關鍵的外部服務、API 或系統]
`;