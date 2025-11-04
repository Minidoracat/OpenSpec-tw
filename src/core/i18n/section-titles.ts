/**
 * 多語言區段標題映射
 * 支援英文和繁體中文的標題識別
 */

/**
 * 規範文件的區段標題
 */
export const SPEC_SECTIONS = {
  /** 目的區段 */
  PURPOSE: ['Purpose', '目的'],
  /** 需求區段 */
  REQUIREMENTS: ['Requirements', '需求'],
} as const;

/**
 * 變更文件的區段標題
 */
export const CHANGE_SECTIONS = {
  /** 為什麼區段 */
  WHY: ['Why', '為什麼'],
  /** 變更內容區段 */
  WHAT_CHANGES: ['What Changes', '變更內容'],
} as const;

/**
 * 差異類型的區段標題
 */
export const DELTA_SECTIONS = {
  /** 新增需求 */
  ADDED: ['ADDED Requirements', '新增需求'],
  /** 修改需求 */
  MODIFIED: ['MODIFIED Requirements', '修改需求'],
  /** 移除需求 */
  REMOVED: ['REMOVED Requirements', '移除需求'],
  /** 重新命名需求 */
  RENAMED: ['RENAMED Requirements', '重新命名需求'],
} as const;

/**
 * 需求區塊的標題前綴
 */
export const REQUIREMENT_PREFIXES = ['Requirement:', '需求：'] as const;

/**
 * 情境的標題前綴
 */
export const SCENARIO_PREFIXES = ['Scenario:', '情境：'] as const;

/**
 * 將標題陣列轉換為小寫，用於 case-insensitive 比對
 */
export function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}

/**
 * 檢查標題是否匹配多語言標題列表
 * @param title 要檢查的標題
 * @param titleVariants 支援的標題變體（英文、繁體中文）
 * @returns 是否匹配
 */
export function matchesTitle(title: string, titleVariants: readonly string[]): boolean {
  const normalizedTitle = normalizeTitle(title);
  return titleVariants.some(variant => normalizeTitle(variant) === normalizedTitle);
}

/**
 * 從標題列表中找到匹配的標題（遞迴搜尋包含 children）
 * @param sections 區段列表
 * @param titleVariants 支援的標題變體
 * @returns 找到的區段或 undefined
 */
export function findSectionByTitleVariants<T extends { title: string; children?: T[] }>(
  sections: T[],
  titleVariants: readonly string[]
): T | undefined {
  for (const section of sections) {
    if (matchesTitle(section.title, titleVariants)) {
      return section;
    }
    // 遞迴搜尋子區段
    if (section.children && section.children.length > 0) {
      const child = findSectionByTitleVariants(section.children, titleVariants);
      if (child) {
        return child;
      }
    }
  }
  return undefined;
}
