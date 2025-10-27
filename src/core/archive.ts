import { promises as fs } from 'fs';
import path from 'path';
import { select, confirm } from '@inquirer/prompts';
import { FileSystemUtils } from '../utils/file-system.js';
import { getTaskProgressForChange, formatTaskStatus } from '../utils/task-progress.js';
import { Validator } from './validation/validator.js';
import chalk from 'chalk';
import {
  extractRequirementsSection,
  parseDeltaSpec,
  normalizeRequirementName,
  type RequirementBlock,
} from './parsers/requirement-blocks.js';

interface SpecUpdate {
  source: string;
  target: string;
  exists: boolean;
}

export class ArchiveCommand {
  async execute(
    changeName?: string,
    options: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean } = {}
  ): Promise<void> {
    const targetPath = '.';
    const changesDir = path.join(targetPath, 'openspec', 'changes');
    const archiveDir = path.join(changesDir, 'archive');
    const mainSpecsDir = path.join(targetPath, 'openspec', 'specs');

    // Check if changes directory exists
    try {
      await fs.access(changesDir);
    } catch {
      throw new Error("找不到 OpenSpec 變更目錄。請先執行 'openspec-tw init'。");
    }

    // Get change name interactively if not provided
    if (!changeName) {
      const selectedChange = await this.selectChange(changesDir);
      if (!selectedChange) {
        console.log('未選擇變更。中止操作。');
        return;
      }
      changeName = selectedChange;
    }

    const changeDir = path.join(changesDir, changeName);

    // Verify change exists
    try {
      const stat = await fs.stat(changeDir);
      if (!stat.isDirectory()) {
        throw new Error(`找不到變更 '${changeName}'。`);
      }
    } catch {
      throw new Error(`找不到變更 '${changeName}'。`);
    }

    const skipValidation = options.validate === false || options.noValidate === true;

    // Validate specs and change before archiving
    if (!skipValidation) {
      const validator = new Validator();
      let hasValidationErrors = false;

      // Validate proposal.md (non-blocking unless strict mode desired in future)
      const changeFile = path.join(changeDir, 'proposal.md');
      try {
        await fs.access(changeFile);
        const changeReport = await validator.validateChange(changeFile);
        // Proposal validation is informative only (do not block archive)
        if (!changeReport.valid) {
          console.log(chalk.yellow(`\nproposal.md 中的提案警告（不阻止封存）：`));
          for (const issue of changeReport.issues) {
            const symbol = issue.level === 'ERROR' ? '⚠' : (issue.level === 'WARNING' ? '⚠' : 'ℹ');
            console.log(chalk.yellow(`  ${symbol} ${issue.message}`));
          }
        }
      } catch {
        // Change file doesn't exist, skip validation
      }

      // Validate delta-formatted spec files under the change directory if present
      const changeSpecsDir = path.join(changeDir, 'specs');
      let hasDeltaSpecs = false;
      try {
        const candidates = await fs.readdir(changeSpecsDir, { withFileTypes: true });
        for (const c of candidates) {
          if (c.isDirectory()) {
            try {
              const candidatePath = path.join(changeSpecsDir, c.name, 'spec.md');
              await fs.access(candidatePath);
              const content = await fs.readFile(candidatePath, 'utf-8');
              if (/^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements/m.test(content)) {
                hasDeltaSpecs = true;
                break;
              }
            } catch {}
          }
        }
      } catch {}
      if (hasDeltaSpecs) {
        const deltaReport = await validator.validateChangeDeltaSpecs(changeDir);
        if (!deltaReport.valid) {
          hasValidationErrors = true;
          console.log(chalk.red(`\n變更差異規範中的驗證錯誤：`));
          for (const issue of deltaReport.issues) {
            if (issue.level === 'ERROR') {
              console.log(chalk.red(`  ✗ ${issue.message}`));
            } else if (issue.level === 'WARNING') {
              console.log(chalk.yellow(`  ⚠ ${issue.message}`));
            }
          }
        }
      }

      if (hasValidationErrors) {
        console.log(chalk.red('\n驗證失敗。請在封存前修正錯誤。'));
        console.log(chalk.yellow('若要跳過驗證（不建議），請使用 --no-validate 旗標。'));
        return;
      }
    } else {
      // Log warning when validation is skipped
      const timestamp = new Date().toISOString();
      
      if (!options.yes) {
        const proceed = await confirm({
          message: chalk.yellow('⚠️  警告：跳過驗證可能會封存無效的規範。要繼續嗎？（y/N）'),
          default: false
        });
        if (!proceed) {
          console.log('已取消封存。');
          return;
        }
      } else {
        console.log(chalk.yellow(`\n⚠️  警告：跳過驗證可能會封存無效的規範。`));
      }

      console.log(chalk.yellow(`[${timestamp}] 已跳過變更的驗證：${changeName}`));
      console.log(chalk.yellow(`受影響的檔案：${changeDir}`));
    }

    // Show progress and check for incomplete tasks
    const progress = await getTaskProgressForChange(changesDir, changeName);
    const status = formatTaskStatus(progress);
    console.log(`任務狀態：${status}`);

    const incompleteTasks = Math.max(progress.total - progress.completed, 0);
    if (incompleteTasks > 0) {
      if (!options.yes) {
        const proceed = await confirm({
          message: `警告：發現 ${incompleteTasks} 個未完成的任務。要繼續嗎？`,
          default: false
        });
        if (!proceed) {
          console.log('已取消封存。');
          return;
        }
      } else {
        console.log(`警告：發現 ${incompleteTasks} 個未完成的任務。因為使用了 --yes 旗標而繼續。`);
      }
    }

    // Handle spec updates unless skipSpecs flag is set
    if (options.skipSpecs) {
      console.log('跳過規範更新（提供了 --skip-specs 旗標）。');
    } else {
      // Find specs to update
      const specUpdates = await this.findSpecUpdates(changeDir, mainSpecsDir);

      if (specUpdates.length > 0) {
        console.log('\n要更新的規範：');
        for (const update of specUpdates) {
          const status = update.exists ? '更新' : '建立';
          const capability = path.basename(path.dirname(update.target));
          console.log(`  ${capability}：${status}`);
        }

        let shouldUpdateSpecs = true;
        if (!options.yes) {
          shouldUpdateSpecs = await confirm({
            message: '要繼續更新規範嗎？',
            default: true
          });
          if (!shouldUpdateSpecs) {
            console.log('跳過規範更新。繼續封存。');
          }
        }

        if (shouldUpdateSpecs) {
          // Prepare all updates first (validation pass, no writes)
          const prepared: Array<{ update: SpecUpdate; rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> = [];
          try {
            for (const update of specUpdates) {
              const built = await this.buildUpdatedSpec(update, changeName!);
              prepared.push({ update, rebuilt: built.rebuilt, counts: built.counts });
            }
          } catch (err: any) {
            console.log(String(err.message || err));
            console.log('已中止。未變更任何檔案。');
            return;
          }

          // All validations passed; pre-validate rebuilt full spec and then write files and display counts
          let totals = { added: 0, modified: 0, removed: 0, renamed: 0 };
          for (const p of prepared) {
            const specName = path.basename(path.dirname(p.update.target));
            if (!skipValidation) {
              const report = await new Validator().validateSpecContent(specName, p.rebuilt);
              if (!report.valid) {
                console.log(chalk.red(`\n重建的 ${specName} 規範中的驗證錯誤（不會寫入變更）：`));
                for (const issue of report.issues) {
                  if (issue.level === 'ERROR') console.log(chalk.red(`  ✗ ${issue.message}`));
                  else if (issue.level === 'WARNING') console.log(chalk.yellow(`  ⚠ ${issue.message}`));
                }
                console.log('已中止。未變更任何檔案。');
                return;
              }
            }
            await this.writeUpdatedSpec(p.update, p.rebuilt, p.counts);
            totals.added += p.counts.added;
            totals.modified += p.counts.modified;
            totals.removed += p.counts.removed;
            totals.renamed += p.counts.renamed;
          }
          console.log(
            `總計：+ ${totals.added}, ~ ${totals.modified}, - ${totals.removed}, → ${totals.renamed}`
          );
          console.log('規範已成功更新。');
        }
      }
    }

    // Create archive directory with date prefix
    const archiveName = `${this.getArchiveDate()}-${changeName}`;
    const archivePath = path.join(archiveDir, archiveName);

    // Check if archive already exists
    try {
      await fs.access(archivePath);
      throw new Error(`封存 '${archiveName}' 已存在。`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create archive directory if needed
    await fs.mkdir(archiveDir, { recursive: true });

    // Move change to archive
    await fs.rename(changeDir, archivePath);

    console.log(`變更 '${changeName}' 已封存為 '${archiveName}'。`);
  }

  private async selectChange(changesDir: string): Promise<string | null> {
    // Get all directories in changes (excluding archive)
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const changeDirs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name)
      .sort();

    if (changeDirs.length === 0) {
      console.log('找不到使用中的變更。');
      return null;
    }

    // Build choices with progress inline to avoid duplicate lists
    let choices: Array<{ name: string; value: string }> = changeDirs.map(name => ({ name, value: name }));
    try {
      const progressList: Array<{ id: string; status: string }> = [];
      for (const id of changeDirs) {
        const progress = await getTaskProgressForChange(changesDir, id);
        const status = formatTaskStatus(progress);
        progressList.push({ id, status });
      }
      const nameWidth = Math.max(...progressList.map(p => p.id.length));
      choices = progressList.map(p => ({
        name: `${p.id.padEnd(nameWidth)}     ${p.status}`,
        value: p.id
      }));
    } catch {
      // If anything fails, fall back to simple names
      choices = changeDirs.map(name => ({ name, value: name }));
    }

    try {
      const answer = await select({
        message: '選擇要封存的變更',
        choices
      });
      return answer;
    } catch (error) {
      // User cancelled (Ctrl+C)
      return null;
    }
  }

  // Deprecated: replaced by shared task-progress utilities
  private async checkIncompleteTasks(_tasksPath: string): Promise<number> {
    return 0;
  }

  private async findSpecUpdates(changeDir: string, mainSpecsDir: string): Promise<SpecUpdate[]> {
    const updates: SpecUpdate[] = [];
    const changeSpecsDir = path.join(changeDir, 'specs');

    try {
      const entries = await fs.readdir(changeSpecsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specFile = path.join(changeSpecsDir, entry.name, 'spec.md');
          const targetFile = path.join(mainSpecsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specFile);
            
            // Check if target exists
            let exists = false;
            try {
              await fs.access(targetFile);
              exists = true;
            } catch {
              exists = false;
            }

            updates.push({
              source: specFile,
              target: targetFile,
              exists
            });
          } catch {
            // Source spec doesn't exist, skip
          }
        }
      }
    } catch {
      // No specs directory in change
    }

    return updates;
  }

  private async buildUpdatedSpec(update: SpecUpdate, changeName: string): Promise<{ rebuilt: string; counts: { added: number; modified: number; removed: number; renamed: number } }> {
    // Read change spec content (delta-format expected)
    const changeContent = await fs.readFile(update.source, 'utf-8');

    // Parse deltas from the change spec file
    const plan = parseDeltaSpec(changeContent);
    const specName = path.basename(path.dirname(update.target));

    // Pre-validate duplicates within sections
    const addedNames = new Set<string>();
    for (const add of plan.added) {
      const name = normalizeRequirementName(add.name);
      if (addedNames.has(name)) {
        throw new Error(
          `${specName} validation failed - duplicate requirement in ADDED for header "### Requirement: ${add.name}"`
        );
      }
      addedNames.add(name);
    }
    const modifiedNames = new Set<string>();
    for (const mod of plan.modified) {
      const name = normalizeRequirementName(mod.name);
      if (modifiedNames.has(name)) {
        throw new Error(
          `${specName} validation failed - duplicate requirement in MODIFIED for header "### Requirement: ${mod.name}"`
        );
      }
      modifiedNames.add(name);
    }
    const removedNamesSet = new Set<string>();
    for (const rem of plan.removed) {
      const name = normalizeRequirementName(rem);
      if (removedNamesSet.has(name)) {
        throw new Error(
          `${specName} validation failed - duplicate requirement in REMOVED for header "### Requirement: ${rem}"`
        );
      }
      removedNamesSet.add(name);
    }
    const renamedFromSet = new Set<string>();
    const renamedToSet = new Set<string>();
    for (const { from, to } of plan.renamed) {
      const fromNorm = normalizeRequirementName(from);
      const toNorm = normalizeRequirementName(to);
      if (renamedFromSet.has(fromNorm)) {
        throw new Error(
          `${specName} validation failed - duplicate FROM in RENAMED for header "### Requirement: ${from}"`
        );
      }
      if (renamedToSet.has(toNorm)) {
        throw new Error(
          `${specName} validation failed - duplicate TO in RENAMED for header "### Requirement: ${to}"`
        );
      }
      renamedFromSet.add(fromNorm);
      renamedToSet.add(toNorm);
    }

    // Pre-validate cross-section conflicts
    const conflicts: Array<{ name: string; a: string; b: string }> = [];
    for (const n of modifiedNames) {
      if (removedNamesSet.has(n)) conflicts.push({ name: n, a: 'MODIFIED', b: 'REMOVED' });
      if (addedNames.has(n)) conflicts.push({ name: n, a: 'MODIFIED', b: 'ADDED' });
    }
    for (const n of addedNames) {
      if (removedNamesSet.has(n)) conflicts.push({ name: n, a: 'ADDED', b: 'REMOVED' });
    }
    // Renamed interplay: MODIFIED must reference the NEW header, not FROM
    for (const { from, to } of plan.renamed) {
      const fromNorm = normalizeRequirementName(from);
      const toNorm = normalizeRequirementName(to);
      if (modifiedNames.has(fromNorm)) {
        throw new Error(
          `${specName} validation failed - when a rename exists, MODIFIED must reference the NEW header "### Requirement: ${to}"`
        );
      }
      // Detect ADDED colliding with a RENAMED TO
      if (addedNames.has(toNorm)) {
        throw new Error(
          `${specName} validation failed - RENAMED TO header collides with ADDED for "### Requirement: ${to}"`
        );
      }
    }
    if (conflicts.length > 0) {
      const c = conflicts[0];
      throw new Error(
        `${specName} validation failed - requirement present in multiple sections (${c.a} and ${c.b}) for header "### Requirement: ${c.name}"`
      );
    }
    const hasAnyDelta = (plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length) > 0;
    if (!hasAnyDelta) {
      throw new Error(
        `Delta parsing found no operations for ${path.basename(path.dirname(update.source))}. ` +
        `Provide ADDED/MODIFIED/REMOVED/RENAMED sections in change spec.`
      );
    }

    // Load or create base target content
    let targetContent: string;
    try {
      targetContent = await fs.readFile(update.target, 'utf-8');
    } catch {
      // Target spec does not exist; only ADDED operations are permitted
      if (plan.modified.length > 0 || plan.removed.length > 0 || plan.renamed.length > 0) {
        throw new Error(
          `${specName}: target spec does not exist; only ADDED requirements are allowed for new specs.`
        );
      }
      targetContent = this.buildSpecSkeleton(specName, changeName);
    }

    // Extract requirements section and build name->block map
    const parts = extractRequirementsSection(targetContent);
    const nameToBlock = new Map<string, RequirementBlock>();
    for (const block of parts.bodyBlocks) {
      nameToBlock.set(normalizeRequirementName(block.name), block);
    }

    // Apply operations in order: RENAMED → REMOVED → MODIFIED → ADDED
    // RENAMED
    for (const r of plan.renamed) {
      const from = normalizeRequirementName(r.from);
      const to = normalizeRequirementName(r.to);
      if (!nameToBlock.has(from)) {
        throw new Error(
          `${specName} RENAMED failed for header "### Requirement: ${r.from}" - source not found`
        );
      }
      if (nameToBlock.has(to)) {
        throw new Error(
          `${specName} RENAMED failed for header "### Requirement: ${r.to}" - target already exists`
        );
      }
      const block = nameToBlock.get(from)!;
      const newHeader = `### Requirement: ${to}`;
      const rawLines = block.raw.split('\n');
      rawLines[0] = newHeader;
      const renamedBlock: RequirementBlock = {
        headerLine: newHeader,
        name: to,
        raw: rawLines.join('\n'),
      };
      nameToBlock.delete(from);
      nameToBlock.set(to, renamedBlock);
    }

    // REMOVED
    for (const name of plan.removed) {
      const key = normalizeRequirementName(name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${specName} REMOVED failed for header "### Requirement: ${name}" - not found`
        );
      }
      nameToBlock.delete(key);
    }

    // MODIFIED
    for (const mod of plan.modified) {
      const key = normalizeRequirementName(mod.name);
      if (!nameToBlock.has(key)) {
        throw new Error(
          `${specName} MODIFIED failed for header "### Requirement: ${mod.name}" - not found`
        );
      }
      // Replace block with provided raw (ensure header line matches key)
      const modHeaderMatch = mod.raw.split('\n')[0].match(/^###\s*Requirement:\s*(.+)\s*$/);
      if (!modHeaderMatch || normalizeRequirementName(modHeaderMatch[1]) !== key) {
        throw new Error(
          `${specName} MODIFIED failed for header "### Requirement: ${mod.name}" - header mismatch in content`
        );
      }
      nameToBlock.set(key, mod);
    }

    // ADDED
    for (const add of plan.added) {
      const key = normalizeRequirementName(add.name);
      if (nameToBlock.has(key)) {
        throw new Error(
          `${specName} ADDED failed for header "### Requirement: ${add.name}" - already exists`
        );
      }
      nameToBlock.set(key, add);
    }

    // Duplicates within resulting map are implicitly prevented by key uniqueness.

    // Recompose requirements section preserving original ordering where possible
    const keptOrder: RequirementBlock[] = [];
    const seen = new Set<string>();
    for (const block of parts.bodyBlocks) {
      const key = normalizeRequirementName(block.name);
      const replacement = nameToBlock.get(key);
      if (replacement) {
        keptOrder.push(replacement);
        seen.add(key);
      }
    }
    // Append any newly added that were not in original order
    for (const [key, block] of nameToBlock.entries()) {
      if (!seen.has(key)) {
        keptOrder.push(block);
      }
    }

    const reqBody = [
      parts.preamble && parts.preamble.trim() ? parts.preamble.trimEnd() : ''
    ]
      .filter(Boolean)
      .concat(keptOrder.map(b => b.raw))
      .join('\n\n')
      .trimEnd();

    const rebuilt = [
      parts.before.trimEnd(),
      parts.headerLine,
      reqBody,
      parts.after
    ]
      .filter((s, idx) => !(idx === 0 && s === ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    return {
      rebuilt,
      counts: {
        added: plan.added.length,
        modified: plan.modified.length,
        removed: plan.removed.length,
        renamed: plan.renamed.length,
      }
    };
  }

  private async writeUpdatedSpec(update: SpecUpdate, rebuilt: string, counts: { added: number; modified: number; removed: number; renamed: number }): Promise<void> {
    // Create target directory if needed
    const targetDir = path.dirname(update.target);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(update.target, rebuilt);

    const specName = path.basename(path.dirname(update.target));
    console.log(`將變更套用至 openspec/specs/${specName}/spec.md：`);
    if (counts.added) console.log(`  + ${counts.added} 已新增`);
    if (counts.modified) console.log(`  ~ ${counts.modified} 已修改`);
    if (counts.removed) console.log(`  - ${counts.removed} 已移除`);
    if (counts.renamed) console.log(`  → ${counts.renamed} 已重新命名`);
  }

  private buildSpecSkeleton(specFolderName: string, changeName: string): string {
    const titleBase = specFolderName;
    return `# ${titleBase} Specification\n\n## Purpose\nTBD - created by archiving change ${changeName}. Update Purpose after archive.\n\n## Requirements\n`;
  }

  private getArchiveDate(): string {
    // Returns date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  }
}
