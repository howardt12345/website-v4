import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';

const ROOT = resolve(import.meta.dirname, '..');
const APP_DIR = join(ROOT, 'app');
const PLUGIN_FILE = join(APP_DIR, 'plugins', '01.fontawesome.ts');
const LINKS_FILE = join(APP_DIR, 'composables', 'links.ts');

const ICON_PACKAGE_PREFIX = {
  '@fortawesome/free-solid-svg-icons': 'fas',
  '@fortawesome/free-regular-svg-icons': 'far',
  '@fortawesome/free-brands-svg-icons': 'fab',
};

const collectRegisteredExports = () => {
  const source = readFileSync(PLUGIN_FILE, 'utf8');
  const importBlock = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]/g;
  const byPackage = new Map();
  for (const [, specifiers, module] of source.matchAll(importBlock)) {
    if (!(module in ICON_PACKAGE_PREFIX)) continue;
    const names = byPackage.get(module) ?? new Set();
    for (const specifier of specifiers.split(',')) {
      const exportName = specifier.trim().split(/\s+as\s+/)[0].trim();
      if (exportName) names.add(exportName);
    }
    byPackage.set(module, names);
  }
  return byPackage;
};

const loadRegisteredIntoLibrary = async (byPackage) => {
  for (const [module, names] of byPackage) {
    const pkg = await import(module);
    library.add(...[...names].map((name) => pkg[name]).filter(Boolean));
  }
};

const withoutComments = (text) =>
  text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');

const collectReferencedIcons = () => {
  const referenced = new Map();
  const record = (prefix, name, source) => {
    const key = `${prefix} fa-${name}`;
    if (!referenced.has(key)) referenced.set(key, { prefix, name, sources: new Set() });
    referenced.get(key).sources.add(source);
  };

  const literalClass = /\b(fas|far|fab) fa-([a-z0-9-]+)/g;
  const files = readdirSync(APP_DIR, { recursive: true, encoding: 'utf8' }).filter((f) =>
    /\.(vue|ts|mts)$/.test(f),
  );
  for (const rel of files) {
    const text = withoutComments(readFileSync(join(APP_DIR, rel), 'utf8'));
    for (const [, prefix, name] of text.matchAll(literalClass)) record(prefix, name, rel);
  }

  // Nav links render `fas fa-${link.icon}` from bare-word icon data; social links carry full classes.
  // ponytail: only this known dynamic source is resolved; a new computed :icon binding elsewhere won't be seen.
  const iconValue = /icon:\s*['"]([^'"]+)['"]/g;
  for (const [, value] of withoutComments(readFileSync(LINKS_FILE, 'utf8')).matchAll(iconValue)) {
    if (value.includes(':')) continue;
    const full = value.match(/^(fas|far|fab) fa-([a-z0-9-]+)$/);
    if (full) record(full[1], full[2], 'composables/links.ts');
    else record('fas', value, 'composables/links.ts');
  }

  return referenced;
};

// Query through the library rather than string-matching names so FontAwesome's own
// alias table resolves deprecated references (fa-times -> xmark) exactly as it does at runtime.
const isRegistered = (prefix, iconName) => {
  try {
    return Boolean(findIconDefinition({ prefix, iconName }));
  } catch {
    return false;
  }
};

await loadRegisteredIntoLibrary(collectRegisteredExports());
const referenced = collectReferencedIcons();
const missing = [...referenced.values()].filter(({ prefix, name }) => !isRegistered(prefix, name));

if (missing.length) {
  console.error('\n[check-fa-icons] Unregistered FontAwesome icons — add them to app/plugins/01.fontawesome.ts:\n');
  for (const { prefix, name, sources } of missing) {
    console.error(`  ✗ ${prefix} fa-${name}   (${[...sources].join(', ')})`);
  }
  console.error('');
  process.exit(1);
}

console.log(`[check-fa-icons] OK — ${referenced.size} referenced icons all registered.`);
