type StorageKind = 'local' | 'session';

const pick = (kind: StorageKind) => (kind === 'local' ? localStorage : sessionStorage);

export const readStorage = (kind: StorageKind, key: string): string | null => {
  if (!import.meta.client) return null;
  try {
    return pick(kind).getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (kind: StorageKind, key: string, value: string): void => {
  if (!import.meta.client) return;
  try {
    pick(kind).setItem(key, value);
  } catch {
    // web storage can be blocked (private mode, sandboxed iframe); persistence is best-effort
  }
};
