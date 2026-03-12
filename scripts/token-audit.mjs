import fs from 'node:fs';
import path from 'node:path';

const strict = process.argv.includes('--strict');
const projectRoot = process.cwd();
const projectName = path.basename(projectRoot);

const canonicalDir = path.resolve(projectRoot, '..', 'design-tokens-canonical', 'output');
const generatedDir = path.join(projectRoot, 'src', 'styles', 'generated');
const reportPath = path.join(projectRoot, 'docs', 'token-audit-report.md');

const fileMap = [
  ['primitives-core.css', 'figma-primitives-core.css'],
  ['semantics-core.css', 'figma-semantics-core.css'],
  ['typography-core.css', 'figma-typography-core.css'],
  ['geometry-foundation.css', 'geometry-foundation.css'],
  ['token-bridges.css', 'token-bridges.css'],
];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function tokenizeDefs(text) {
  const tokens = new Map();
  for (const match of text.matchAll(/^\s*(--[a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*;\s*$/gm)) {
    tokens.set(match[1], match[2]);
  }
  return tokens;
}

function walkFiles(startDir, matcher, out = []) {
  if (!fs.existsSync(startDir)) return out;
  for (const name of fs.readdirSync(startDir)) {
    const full = path.join(startDir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkFiles(full, matcher, out);
      continue;
    }
    if (matcher.test(name)) out.push(full);
  }
  return out;
}

function collectUsageTokens(files) {
  const counts = new Map();
  for (const file of files) {
    const text = readText(file);
    for (const match of text.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
      const token = match[1];
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return counts;
}

function collectSelfReferentialDefs(files) {
  const rows = [];
  const pattern = /^\s*(--[a-zA-Z0-9_-]+)\s*:\s*var\(\s*(--[a-zA-Z0-9_-]+)\s*\)\s*;\s*$/;

  for (const file of files) {
    const rel = path.relative(projectRoot, file).replace(/\\/g, '/');
    const lines = readText(file).split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(pattern);
      if (!match) return;
      if (match[1] !== match[2]) return;
      rows.push({ file: rel, line: idx + 1, token: match[1], declaration: line.trim() });
    });
  }

  return rows;
}

function isAllowedMissing(token) {
  const prefixes = [
    '--radix-',
    '--vaul-',
    '--panel-width',
    '--desktop-panel-width',
    '--card-sync-delay',
    '--glass-sync-delay',
    '--header-height',
    '--footer-height',
    '--form-footer-height',
    '--col-',
    '--depth',
    '--swatch-display',
    '--visual-viewport-height',
    '--splash-bg',
    '--tree-indent-',
  ];

  return prefixes.some((prefix) => token.startsWith(prefix));
}

function collectRawGeometryLiterals(cssFiles) {
  const propertyPattern =
    /(margin|padding|gap|width|height|min-width|min-height|max-width|max-height|inset|top|right|bottom|left|border-radius)\s*:\s*([^;]+);/g;
  const literalPattern = /(^|[\s(,+-])(\d+(\.\d+)?)(px|rem)(?=$|[\s),/+*-])/;
  const rows = [];

  for (const file of cssFiles) {
    const rel = path.relative(projectRoot, file).replace(/\\/g, '/');
    const lines = readText(file).split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(propertyPattern);
      if (!match) return;
      for (const declaration of match) {
        if (!literalPattern.test(declaration)) continue;
        if (declaration.includes('var(--')) continue;
        rows.push({ file: rel, line: idx + 1, declaration: declaration.trim() });
      }
    });
  }
  return rows;
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const syncIssues = [];
for (const [canonicalName, projectNameFile] of fileMap) {
  const canonicalPath = path.join(canonicalDir, canonicalName);
  const localPath = path.join(generatedDir, projectNameFile);
  if (!fs.existsSync(canonicalPath) || !fs.existsSync(localPath)) {
    syncIssues.push(`${projectNameFile}: missing canonical or local file`);
    continue;
  }
  const canonicalText = readText(canonicalPath);
  const localText = readText(localPath);
  if (canonicalText !== localText) {
    syncIssues.push(`${projectNameFile}: diverged from canonical`);
  }
}

const canonicalTokens = new Map();
for (const [canonicalName] of fileMap) {
  const canonicalPath = path.join(canonicalDir, canonicalName);
  if (!fs.existsSync(canonicalPath)) continue;
  for (const [token, value] of tokenizeDefs(readText(canonicalPath))) {
    canonicalTokens.set(token, value);
  }
}

const localGeneratedTokens = new Map();
for (const [, projectNameFile] of fileMap) {
  const localPath = path.join(generatedDir, projectNameFile);
  if (!fs.existsSync(localPath)) continue;
  for (const [token, value] of tokenizeDefs(readText(localPath))) {
    localGeneratedTokens.set(token, value);
  }
}

const missingCanonicalTokens = [];
for (const token of canonicalTokens.keys()) {
  if (!localGeneratedTokens.has(token)) {
    missingCanonicalTokens.push(token);
  }
}

const codeFiles = [
  ...walkFiles(path.join(projectRoot, 'src'), /\.(css|scss|ts|tsx|js|jsx|html)$/i),
  ...walkFiles(path.join(projectRoot, 'public'), /\.(css|scss|ts|tsx|js|jsx|html)$/i),
];
const cssFiles = codeFiles.filter((file) => /\.(css|scss)$/i.test(file));

const definitionTokens = new Set();
for (const file of cssFiles) {
  for (const token of tokenizeDefs(readText(file)).keys()) {
    definitionTokens.add(token);
  }
}

const usageCounts = collectUsageTokens(codeFiles);
const unresolved = [...usageCounts.entries()]
  .filter(([token]) => !definitionTokens.has(token))
  .filter(([token]) => !isAllowedMissing(token))
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const generatedFiles = fileMap
  .map(([, projectNameFile]) => path.join(generatedDir, projectNameFile))
  .filter((filePath) => fs.existsSync(filePath));
const selfReferences = collectSelfReferentialDefs(generatedFiles);
const rawGeometry = collectRawGeometryLiterals(cssFiles);

const lines = [];
lines.push(`# Token Audit Report: ${projectName}`);
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(`Strict mode: ${strict ? 'on' : 'off'}`);
lines.push('');
lines.push('## Summary');
lines.push(`- canonical sync issues: ${syncIssues.length}`);
lines.push(`- missing canonical tokens: ${missingCanonicalTokens.length}`);
lines.push(`- unresolved token usages: ${unresolved.length}`);
lines.push(`- self-referential token definitions: ${selfReferences.length}`);
lines.push(`- raw geometry literal findings: ${rawGeometry.length}`);
lines.push('');

lines.push('## Canonical Sync Issues');
if (!syncIssues.length) {
  lines.push('- none');
} else {
  for (const issue of syncIssues) lines.push(`- ${issue}`);
}
lines.push('');

lines.push('## Missing Canonical Tokens');
if (!missingCanonicalTokens.length) {
  lines.push('- none');
} else {
  for (const token of missingCanonicalTokens.slice(0, 200)) lines.push(`- \`${token}\``);
}
lines.push('');

lines.push('## Unresolved Token Usages');
if (!unresolved.length) {
  lines.push('- none');
} else {
  for (const [token, count] of unresolved.slice(0, 200)) {
    lines.push(`- \`${token}\` (usage count: ${count})`);
  }
}
lines.push('');

lines.push('## Self-Referential Token Definitions');
if (!selfReferences.length) {
  lines.push('- none');
} else {
  for (const row of selfReferences.slice(0, 200)) {
    lines.push(`- ${row.file}:${row.line} -> \`${row.declaration}\``);
  }
}
lines.push('');

lines.push('## Raw Geometry Literal Inventory');
if (!rawGeometry.length) {
  lines.push('- none');
} else {
  for (const row of rawGeometry.slice(0, 300)) {
    lines.push(`- ${row.file}:${row.line} -> \`${row.declaration}\``);
  }
}
lines.push('');

ensureDirForFile(reportPath);
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);

const failures = [];
if (syncIssues.length) failures.push('generated token files are out of sync with canonical output');
if (missingCanonicalTokens.length) failures.push('missing canonical tokens in generated files');
if (selfReferences.length) failures.push('self-referential token definitions found in generated files');
if (strict && unresolved.length) failures.push('strict mode: unresolved token usages found');
if (strict && rawGeometry.length) failures.push('strict mode: raw geometry literals found');

if (failures.length) {
  console.error('Token audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Token audit passed.');
