import { describe, it, expect, beforeEach } from "bun:test";
import { createClient } from "../client";
import CommandService from "../../src/services/CommandService";
import Client from "../../src/core/Client";
import Command from "../../src/core/Command";
import { Awaitable } from "discord.js";

describe("CommandService", () => {
    let service: CommandService;
    let client: Client;

    beforeEach(async () => {
        client = await createClient(false);
        service = new CommandService(client);
    });

    it('can be created', () => {
        expect(service.commands.size).toBe(0);
    });

    it('can add new commands', () => {
        const TestCommand = class extends Command {
            public readonly description: string = 'test command';
            public readonly name: string = 'test';
            public readonly group: string = 'testing';
            public readonly syntax: string = '<arg>';

            public handle(): Awaitable<void> {
                return undefined;
            }
        };

        const command = new TestCommand(client);

        service.addCommand(command);

        expect(service.commands.size).toBe(1);
        expect(service.commands.get('test')).toBeInstanceOf(TestCommand);
    });
});