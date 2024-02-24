import * as fs from "fs/promises";
import { existsSync } from "node:fs";

class FileSystem {
    private static readonly isBun = !!process.isBun;

    static async readFile(path: string, { json }: ReadFileOptions = {}) {
        if (this.isBun) {
            const file = Bun.file(path);
            return json ? await file.json() : await file.text();
        }

        const contents = await fs.readFile(path, { encoding: 'utf-8' });

        if (json) {
            return JSON.parse(contents);
        }

        return contents;
    }

    static async writeFile(path: string, data: unknown, { json, prettify }: WriteFileOptions = {}) {
        const input = json ? JSON.stringify(data, prettify ? null : undefined, prettify ? 4 : undefined) : data as string;

        if (this.isBun) {
            await Bun.write(path, input);
            return ;
        }

        await fs.writeFile(path, input, {
            encoding: 'utf-8',
        });
    }

    static async exists(path: string) {
        if (this.isBun) {
            return Bun.file(path).exists();
        }

        return existsSync(path);
    }
}

type ReadFileOptions = {
    json?: boolean;
};

type WriteFileOptions = {
    json?: boolean;
    prettify?: boolean;
};

export default FileSystem;