import Client from "../src/core/Client";

export const createClient = async (boot = true) => {
    process.env.SUPRESS_LOGS = 'true';

    const client = new Client();

    if (boot) {
        await client.boot();
    }

    return client;
};