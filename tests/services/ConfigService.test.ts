import { beforeEach, describe, expect, it, mock, test } from "bun:test";
import ConfigService from "../../src/services/ConfigService";
import { createClient } from "../client";
import { faker } from '@faker-js/faker';
import FileSystem from "../../src/core/FileSystem";

describe("ConfigService", async () => {
    const client = await createClient();
    let service: ConfigService;
    const guildId = faker.string.numeric(12);
    const prefix = faker.string.sample(1);
    const config = {
        [guildId]: {
            prefix
        }
    };

    beforeEach(() => {
        service = new ConfigService(client);
    });

    it("can be created", () => {
        new ConfigService(client);
    });

    it("can load the configuration files", async () => {
        const readFileOriginal = FileSystem.readFile;
        const readFileMocked = mock(async (path: string, { json }: { json?: boolean } = {}) => {
            if (path.endsWith('config.json')) {
                return json ? config : JSON.stringify(config);
            }

            return json ? {} : '{}';
        });
        FileSystem.readFile = readFileMocked;

        expect(service.entries()).toBeEmptyObject();

        await service.load();
        FileSystem.readFile = readFileOriginal;

        expect(service.entries()[guildId]).toBeObject();
        expect(service.entries()[guildId].prefix).toBe(prefix);
        expect(readFileMocked.mock.calls.length).toBe(1);
    });

    it("can load the configuration files on boot", async () => {
        const loadOriginal = service.load;
        const loadMock = mock();
        service.load = loadMock;
        await service.boot();
        service.load = loadOriginal;
        expect(loadMock.mock.calls.length).toBe(1);
    });

    test("the autoConfigureGuild() method works", () => {
        expect(service.entries()).toBeEmptyObject();
        service.autoConfigureGuild(guildId);
        expect(service.entries()).not.toBeEmptyObject();
        expect(service.entries()[guildId]).toBeObject();
    });
});