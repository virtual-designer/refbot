import Service from "../core/Service";
import crypto from 'crypto';
import { Collection, Snowflake } from "discord.js";
import path from "node:path";
import FileSystem from "../core/FileSystem";

export type Referral = {
    id: number;
    code: string;
    createdBy: string;
    usedBy: Snowflake[];
    guildId: Snowflake;
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt: Date;
};

class ReferralService extends Service {
    public readonly name = "referral";
    public readonly cache = new Collection<string, Referral>();
    private currentId: number = 1;
    public readonly dataFilePath = process.env.DATA_FILE_PATH ?? path.resolve(__dirname, '../../data.json');
    public readonly alpha: string[] = [];

    public async boot() {
        this.generateAlphabetTable();

        if (!await FileSystem.exists(this.dataFilePath)) {
            await FileSystem.writeFile(this.dataFilePath, {
                currentId: 1,
                refs: []
            }, { json: true, prettify: true });
        }

        await this.reload();
    }

    protected generateAlphabetTable() {
        for (let i = 48; i < 123; i++) {
            if (i === 58) {
                i = 65;
            }
            else if (i === 91) {
                i = 97;
            }

            this.alpha.push(String.fromCharCode(i));
        }

        this.alpha.push('-');
        console.log(this.alpha);
    }

    public async reload() {
        const data = await FileSystem.readFile(this.dataFilePath, { json: true });

        this.cache.clear();
        this.currentId = data.currentId;

        for (const ref of data.refs) {
            this.cache.set(ref.code, ref);
            ref.createdAt = new Date(ref.createdAt);
            ref.updatedAt = new Date(ref.updatedAt);
            ref.lastUsedAt = new Date(ref.lastUsedAt);
        }

        this.client.logger.info(`Current database has ${data.refs.length} refs.`);
    }

    public async sync() {
        await FileSystem.writeFile(this.dataFilePath, {
            currentId: this.currentId,
            refs: [...this.cache.values()]
        }, { json: true, prettify: true });

        this.client.logger.info(`Wrote ${this.cache.size} entries to the database.`);
    }

    public getCurrentId() {
        return this.currentId;
    }

    public generateRandomCode(length: number = 16) {
        let code = '';

        for (let i = 0; i < length; i++) {
            code += this.alpha.at(Math.floor(Math.random() * this.alpha.length));
        }

        return code;
    }

    async createCode(createdBy: Snowflake, guildId: Snowflake, code?: string): Promise<Referral | null> {
        if (code) {
            const ref = this.findRef(code);

            if (ref) {
                return null;
            }
        }

        const ref: Referral = {
            id: this.currentId++,
            code: code ?? this.generateRandomCode(),
            createdBy,
            usedBy: [],
            guildId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastUsedAt: new Date(),
        };

        this.cache.set(ref.code, ref);
        await this.sync();
        return ref;
    }

    public async addUser(code: string, guildId: Snowflake, userId: Snowflake) {
        const ref = this.findRef(code, undefined, guildId);

        if (!ref) {
            return { ref: null, error: "No such referral found with that code!" };
        }

        if (ref.createdBy === userId) {
            return { ref: null, error: "You may not use your own referral code!" };
        }

        if (ref.usedBy.includes(userId)) {
            return { ref: null, error: "You have already used this referral code!" };
        }

        for (const ref of this.cache.values()) {
            if (ref.usedBy.includes(userId) && ref.guildId === guildId) {
                const guild = this.client.guilds.cache.get(ref.guildId);
                return { ref: null, error: `You have already used a referral code in ${guild?.name ?? 'the server'}!` };
            }
        }

        ref.usedBy.push(userId);
        ref.updatedAt = new Date();
        ref.lastUsedAt = new Date();
        await this.sync();
        return { ref, error: null };
    }

    public findRef(code: string, userId?: Snowflake, guildId?: string) {
        const ref = this.cache.get(code);

        if (!ref) {
            return null;
        }

        if (userId && ref.createdBy !== userId) {
            return null;
        }

        if (guildId && ref.guildId !== guildId) {
            return null;
        }

        return ref;
    }

    public async deleteRef(code: string, guildId?: Snowflake, userId?: Snowflake) {
        const ref = this.findRef(code, userId, guildId);

        if (!ref) {
            return { ref: null, error: "No such referral found with that ID!" };
        }

        this.cache.delete(code);
        await this.sync();
        return { ref, error: null };
    }

    public async updateRefCode(code: string, guildId?: Snowflake, newCode?: string, userId?: Snowflake) {
        const newCodeGenerated = newCode ?? this.generateRandomCode();

        if (newCode) {
            const ref = this.findRef(newCode, undefined);

            if (ref) {
                return { code: null, error: "The given referral code is already taken!" };
            }
        }

        const ref = this.findRef(code, userId, guildId);

        if (!ref) {
            return { code: null, error: "No such referral found with that code." };
        }

        ref.code = newCodeGenerated;
        ref.updatedAt = new Date();
        await this.sync();

        return {
            code,
            error: null
        };
    }

    public getRefs(guildId?: Snowflake) {
        if (guildId) {
            return [...this.cache.filter(ref => ref.guildId === guildId).values()];
        }

        return [...this.cache.values()];
    }
}

export default ReferralService;