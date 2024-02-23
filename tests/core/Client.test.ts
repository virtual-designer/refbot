import { describe, it, expect } from "bun:test";
import { createClient } from "../client";
import Client from "../../src/core/Client";
import { Client as DiscordClient } from "discord.js";

describe('Client', () => {
    it('can be created and booted', async () => {
        const client = await createClient();

        expect(client).toBeInstanceOf(Client);
        expect(client).toBeInstanceOf(DiscordClient);
    });
});