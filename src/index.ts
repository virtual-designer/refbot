import 'dotenv/config';
import Client from "./core/Client";

async function main() {
    const client = new Client();

    await client.boot();
    // await client.login(process.env.BOT_TOKEN);
}

export default main();

