import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFilesRecursively(fullPath, fileList);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

test.describe('Data Layer Isolation & Architectural Guard', () => {
  test('no page or component under src/app or src/components imports seed-products directly', () => {
    const root = process.cwd();
    const appDir = path.join(root, 'src', 'app');
    const compDir = path.join(root, 'src', 'components');

    const appFiles = getFilesRecursively(appDir);
    const compFiles = getFilesRecursively(compDir);
    const targetFiles = [...appFiles, ...compFiles];

    const violations: { file: string; line: string }[] = [];
    const forbiddenPattern = /from\s+['"].*data\/seed-products['"]|import\s+.*['"].*data\/seed-products['"]|require\(['"].*data\/seed-products['"]\)/;

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (forbiddenPattern.test(line)) {
          violations.push({
            file: path.relative(root, file),
            line: `L${index + 1}: ${line.trim()}`,
          });
        }
      });
    }

    expect(
      violations,
      `Found direct imports of seed-products file in UI components/pages:\n${violations
        .map((v) => `${v.file} -> ${v.line}`)
        .join('\n')}`
    ).toHaveLength(0);
  });
});
