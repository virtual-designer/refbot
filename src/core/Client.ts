import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import { Logger } from "../utils/Logger";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import figlet from 'figlet';
import chalk from 'chalk';
import { version } from '../../package.json';
import Service from "./Service";
import CommandService from "../services/CommandService";
import Fetcher from "../utils/Fetcher";

class Client extends DiscordClient {
    protected static readonly intents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
    ];
    public static readonly logger = new Logger('system', !process.env.NO_LOG_DATE_TIME);
    public readonly services = new Map<string, Service>();

    public constructor() {
        super({
            intents: Client.intents
        });
    }

    public async boot() {
        Fetcher.client = this;

        await this.printBanner();
        await this.loadServices();
        await this.loadEvents();
        await this.loadCommands();
    }

    protected printBanner() {
        return new Promise<void>((resolve, reject) => {
            figlet.text('RefBot', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }

                this.logger.print('info', chalk.whiteBright(data));
                this.logger.print('info', chalk.green(`v${version} -- Booting up`));
                resolve();
            });
        });
    }

    protected async loadEvents(eventsDirectory = path.resolve(__dirname, '../events')) {
        const files = await fs.readdir(eventsDirectory);

        for (const file of files) {
            const filePath = path.join(eventsDirectory, file);
            const stat = await fs.lstat(filePath);

            if (stat.isDirectory()) {
                await this.loadEvents(filePath);
                continue;
            }

            const { default: EventListener } = await import(filePath);
            const eventListener = new EventListener(this);
            this.on(eventListener.name, eventListener.handle.bind(eventListener));
            this.logger.info(`Loaded event: ${eventListener.name}`);
        }
    }

    protected async loadCommands(commandsDirectory = path.resolve(__dirname, '../commands')) {
        const files = await fs.readdir(commandsDirectory);

        for (const file of files) {
            const filePath = path.join(commandsDirectory, file);
            const stat = await fs.lstat(filePath);

            if (stat.isDirectory()) {
                await this.loadCommands(filePath);
                continue;
            }

            const { default: Command } = await import(filePath);
            const command = new Command(this);
            this.getService<CommandService>('command').addCommand(command);
            this.logger.info(`Loaded command: ${command.name}`);
        }
    }

    protected async loadServices(servicesDirectory = path.resolve(__dirname, '../services')) {
        const files = await fs.readdir(servicesDirectory);

        for (const file of files) {
            const filePath = path.join(servicesDirectory, file);
            const stat = await fs.lstat(filePath);

            if (stat.isDirectory()) {
                await this.loadServices(filePath);
                continue;
            }

            const { default: Service } = await import(filePath);
            const service = new Service(this);
            await service.boot();
            this.services.set(service.name, service);
            this.logger.info(`Loaded service: ${service.name}`);
        }
    }

    get logger() {
        return Client.logger;
    }

    getService<S extends Service = Service>(name: string) {
        return this.services.get(name) as S;
    }
}

export default Client;