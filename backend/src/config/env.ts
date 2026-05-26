import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnvLine = (line: string) => {
  const normalized = line.trim();

  if (!normalized || normalized.startsWith('#')) return null;

  const match = normalized.match(/^([\w.-]+)\s*=\s*(.*)$/);

  if (!match) return null;

  const key = match[1];
  let value = match[2] || '';

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

export const loadEnvFiles = () => {
  const lockedKeys = new Set(Object.keys(process.env));
  const loadedPaths = new Set<string>();
  const candidatePaths = [
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'backend/.env'),
  ];

  candidatePaths.forEach((envPath) => {
    if (loadedPaths.has(envPath) || !existsSync(envPath)) return;

    loadedPaths.add(envPath);

    readFileSync(envPath, 'utf8')
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map(parseEnvLine)
      .filter(Boolean)
      .forEach((entry) => {
        if (!entry || lockedKeys.has(entry.key)) return;

        process.env[entry.key] = entry.value;
      });
  });
};
