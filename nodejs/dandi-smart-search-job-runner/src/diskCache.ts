import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(__dirname, '../.cache');

type CacheableValue = string | number | boolean | object | null;

interface CacheData<T> {
  timestamp: number;
  value: T;
}

export async function getCachedResult<T extends CacheableValue>(
  key: string,
  version: string,
  args: CacheableValue[],
  expirationMinutes?: number
): Promise<T | undefined> {
  const cacheKey = computeCacheKey(key, version, args);
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  if (!await fs.pathExists(cacheFile)) {
    return undefined;
  }

  try {
    const cacheData = await fs.readJson(cacheFile) as CacheData<T>;
    if (expirationMinutes !== undefined) {
      const age = (Date.now() - cacheData.timestamp) / (1000 * 60);
      if (age > expirationMinutes) {
        return undefined;
      }
    }
    return cacheData.value;
  } catch {
    return undefined;
  }
}

export async function setCachedResult<T extends CacheableValue>(
  key: string,
  version: string,
  args: CacheableValue[],
  value: T
): Promise<void> {
  const cacheKey = computeCacheKey(key, version, args);
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  await fs.ensureDir(CACHE_DIR);
  await fs.writeJson(cacheFile, {
    timestamp: Date.now(),
    value
  } as CacheData<T>);
}

function computeCacheKey(key: string, version: string, args: CacheableValue[]): string {
  const str = JSON.stringify({ key, version, args });
  return crypto.createHash('sha1').update(str).digest('hex');
}
