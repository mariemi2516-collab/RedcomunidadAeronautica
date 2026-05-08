import fs from "fs/promises";
import path from "path";

import { config } from "../config";

const writeLocks = new Map<string, Promise<void>>();

async function ensureDir(file: string): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

function resolvePath(name: string): string {
  return path.join(config.paths.dataDir, `${name}.json`);
}

export class JsonStore<T> {
  private filePath: string;

  constructor(
    private name: string,
    private defaults: T,
  ) {
    this.filePath = resolvePath(name);
  }

  async read(): Promise<T> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      if (!raw.trim()) return this.cloneDefault();
      return JSON.parse(raw) as T;
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        await this.write(this.defaults);
        return this.cloneDefault();
      }
      throw err;
    }
  }

  async write(value: T): Promise<void> {
    const previous = writeLocks.get(this.name) ?? Promise.resolve();
    const next = previous.then(async () => {
      await ensureDir(this.filePath);
      const tmp = `${this.filePath}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
      await fs.rename(tmp, this.filePath);
    });
    writeLocks.set(
      this.name,
      next.catch(() => undefined),
    );
    await next;
  }

  async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    const current = await this.read();
    const updated = await mutator(current);
    await this.write(updated);
    return updated;
  }

  private cloneDefault(): T {
    return JSON.parse(JSON.stringify(this.defaults)) as T;
  }
}
