import { promises as fs } from 'fs';
import path from 'path';
import { getTaskProgressForChange, formatTaskStatus } from '../utils/task-progress.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MarkdownParser } from './parsers/markdown-parser.js';

interface ChangeInfo {
  name: string;
  completedTasks: number;
  totalTasks: number;
}

export class ListCommand {
  async execute(targetPath: string = '.', mode: 'changes' | 'specs' = 'changes'): Promise<void> {
    if (mode === 'changes') {
      const changesDir = path.join(targetPath, 'openspec', 'changes');
      
      // Check if changes directory exists
      try {
        await fs.access(changesDir);
      } catch {
        throw new Error("找不到 OpenSpec 變更目錄。請先執行 'openspec-tw init'。");
      }

      // Get all directories in changes (excluding archive)
      const entries = await fs.readdir(changesDir, { withFileTypes: true });
      const changeDirs = entries
        .filter(entry => entry.isDirectory() && entry.name !== 'archive')
        .map(entry => entry.name);

      if (changeDirs.length === 0) {
        console.log('找不到使用中的變更。');
        return;
      }

      // Collect information about each change
      const changes: ChangeInfo[] = [];

      for (const changeDir of changeDirs) {
        const progress = await getTaskProgressForChange(changesDir, changeDir);
        changes.push({
          name: changeDir,
          completedTasks: progress.completed,
          totalTasks: progress.total
        });
      }

      // Sort alphabetically by name
      changes.sort((a, b) => a.name.localeCompare(b.name));

      // Display results
      console.log('變更：');
      const padding = '  ';
      const nameWidth = Math.max(...changes.map(c => c.name.length));
      for (const change of changes) {
        const paddedName = change.name.padEnd(nameWidth);
        const status = formatTaskStatus({ total: change.totalTasks, completed: change.completedTasks });
        console.log(`${padding}${paddedName}     ${status}`);
      }
      return;
    }

    // specs mode
    const specsDir = path.join(targetPath, 'openspec', 'specs');
    try {
      await fs.access(specsDir);
    } catch {
      console.log('找不到規範。');
      return;
    }

    const entries = await fs.readdir(specsDir, { withFileTypes: true });
    const specDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    if (specDirs.length === 0) {
      console.log('找不到規範。');
      return;
    }

    type SpecInfo = { id: string; requirementCount: number };
    const specs: SpecInfo[] = [];
    for (const id of specDirs) {
      const specPath = join(specsDir, id, 'spec.md');
      try {
        const content = readFileSync(specPath, 'utf-8');
        const parser = new MarkdownParser(content);
        const spec = parser.parseSpec(id);
        specs.push({ id, requirementCount: spec.requirements.length });
      } catch {
        // If spec cannot be read or parsed, include with 0 count
        specs.push({ id, requirementCount: 0 });
      }
    }

    specs.sort((a, b) => a.id.localeCompare(b.id));
    console.log('規範：');
    const padding = '  ';
    const nameWidth = Math.max(...specs.map(s => s.id.length));
    for (const spec of specs) {
      const padded = spec.id.padEnd(nameWidth);
      console.log(`${padding}${padded}     需求 ${spec.requirementCount}`);
    }
  }
}