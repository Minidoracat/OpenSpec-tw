import { select } from '@inquirer/prompts';
import path from 'path';
import { isInteractive } from '../utils/interactive.js';
import { getActiveChangeIds, getSpecIds } from '../utils/item-discovery.js';
import { ChangeCommand } from './change.js';
import { SpecCommand } from './spec.js';
import { nearestMatches } from '../utils/match.js';

type ItemType = 'change' | 'spec';

const CHANGE_FLAG_KEYS = new Set(['deltasOnly', 'requirementsOnly']);
const SPEC_FLAG_KEYS = new Set(['requirements', 'scenarios', 'requirement']);

export class ShowCommand {
  async execute(itemName?: string, options: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any } = {}): Promise<void> {
    const interactive = isInteractive(options.noInteractive);
    const typeOverride = this.normalizeType(options.type);

    if (!itemName) {
      if (interactive) {
        const type = await select<ItemType>({
          message: '您想要顯示什麼？',
          choices: [
            { name: '變更', value: 'change' as const },
            { name: '規範', value: 'spec' as const },
          ],
        });
        await this.runInteractiveByType(type, options);
        return;
      }
      this.printNonInteractiveHint();
      process.exitCode = 1;
      return;
    }

    await this.showDirect(itemName, { typeOverride, options });
  }

  private normalizeType(value?: string): ItemType | undefined {
    if (!value) return undefined;
    const v = value.toLowerCase();
    if (v === 'change' || v === 'spec') return v;
    return undefined;
  }

  private async runInteractiveByType(type: ItemType, options: { json?: boolean; noInteractive?: boolean; [k: string]: any }): Promise<void> {
    if (type === 'change') {
      const changes = await getActiveChangeIds();
      if (changes.length === 0) {
        console.error('找不到變更。');
        process.exitCode = 1;
        return;
      }
      const picked = await select<string>({ message: '選擇一個變更', choices: changes.map(id => ({ name: id, value: id })) });
      const cmd = new ChangeCommand();
      await cmd.show(picked, options as any);
      return;
    }

    const specs = await getSpecIds();
    if (specs.length === 0) {
      console.error('找不到規範。');
      process.exitCode = 1;
      return;
    }
    const picked = await select<string>({ message: '選擇一個規範', choices: specs.map(id => ({ name: id, value: id })) });
    const cmd = new SpecCommand();
    await cmd.show(picked, options as any);
  }

  private async showDirect(itemName: string, params: { typeOverride?: ItemType; options: { json?: boolean; [k: string]: any } }): Promise<void> {
    // Optimize lookups when type is pre-specified
    let isChange = false;
    let isSpec = false;
    let changes: string[] = [];
    let specs: string[] = [];
    if (params.typeOverride === 'change') {
      changes = await getActiveChangeIds();
      isChange = changes.includes(itemName);
    } else if (params.typeOverride === 'spec') {
      specs = await getSpecIds();
      isSpec = specs.includes(itemName);
    } else {
      [changes, specs] = await Promise.all([getActiveChangeIds(), getSpecIds()]);
      isChange = changes.includes(itemName);
      isSpec = specs.includes(itemName);
    }

    const resolvedType = params.typeOverride ?? (isChange ? 'change' : isSpec ? 'spec' : undefined);

    if (!resolvedType) {
      console.error(`未知項目 '${itemName}'`);
      const suggestions = nearestMatches(itemName, [...changes, ...specs]);
      if (suggestions.length) console.error(`您是否想要：${suggestions.join(', ')}？`);
      process.exitCode = 1;
      return;
    }

    if (!params.typeOverride && isChange && isSpec) {
      console.error(`項目 '${itemName}' 不明確，同時符合變更和規範。`);
      console.error('請傳遞 --type change|spec，或使用：openspec-tw change show / openspec-tw spec show');
      process.exitCode = 1;
      return;
    }

    this.warnIrrelevantFlags(resolvedType, params.options);
    if (resolvedType === 'change') {
      const cmd = new ChangeCommand();
      await cmd.show(itemName, params.options as any);
      return;
    }
    const cmd = new SpecCommand();
    await cmd.show(itemName, params.options as any);
  }

  private printNonInteractiveHint(): void {
    console.error('沒有內容可顯示。請嘗試以下其中之一：');
    console.error('  openspec-tw show <item>');
    console.error('  openspec-tw change show');
    console.error('  openspec-tw spec show');
    console.error('或在互動式終端機中執行。');
  }

  private warnIrrelevantFlags(type: ItemType, options: { [k: string]: any }): boolean {
    const irrelevant: string[] = [];
    if (type === 'change') {
      for (const k of SPEC_FLAG_KEYS) if (k in options) irrelevant.push(k);
    } else {
      for (const k of CHANGE_FLAG_KEYS) if (k in options) irrelevant.push(k);
    }
    if (irrelevant.length > 0) {
      console.error(`警告：忽略不適用於 ${type} 的旗標：${irrelevant.join(', ')}`);
      return true;
    }
    return false;
  }
}


