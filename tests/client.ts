import Client from "../src/core/Client";
import { mock } from "bun:test";

export const createClient = async (boot = true) => {
    process.env.SUPRESS_LOGS = 'true';

    const client = new Client();
    client.initializeDatabase = mock();

    if (boot) {
        await client.boot();
    }

    return client;
};