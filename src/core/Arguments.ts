import Client from "./Client";
import { GuildBasedChannel, GuildMember, Message, User } from "discord.js";
import Fetcher from "../utils/Fetcher";
import type ConfigService from "../services/ConfigService";

class InvalidArgumentException extends Error {
    private index = 0;
    private readonly type: ErrorMessageTypes;

    public constructor(message: string, index: number, type: ErrorMessageTypes) {
        super(message);
        this.setIndex(index);
        this.type = type;
    }

    public setIndex(index: number) {
        this.index = index;
        return this;
    }

    public getIndex() {
        return this.index;
    }

    public getType() {
        return this.type;
    }
}

class Arguments {
    protected readonly argv: string[];
    protected readonly args: string[];
    protected readonly commandName: string;

    public constructor(protected readonly client: Client, protected readonly message: Message) {
        const prefix: string = this.client.getService<ConfigService>('config').config(message.guildId)?.prefix ?? '!';
        this.argv = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
        this.commandName = this.argv[0];
        this.args = this.argv.slice(1);
    }

    public getRaw(index: number) {
        return this.args[index];
    }

    public getArgs() {
        return this.args;
    }

    public getArgv() {
        return this.argv;
    }

    public getCommandName() {
        return this.commandName;
    }

    async at<T extends ArgumentType, O extends boolean>(index: number, type: T, optional?: O, errors?: ErrorMessages): Promise<Argument<T, O>> {
        const argument = this.args.at(index);

        if (argument === undefined) {
            if (optional) {
                return null as Argument<T, O>;
            }
            else {
                throw new InvalidArgumentException(errors?.["required"] ?? `Argument #${index} is required`, index, "required");
            }
        }

        switch (type) {
            case ArgumentType.Channel:
            case ArgumentType.GuildMember:
            case ArgumentType.User:
                const isMention = argument.startsWith(type === ArgumentType.Channel ? '<#' : '<@') && argument.endsWith('>');
                const id = isMention ? argument.slice(argument.startsWith('<@!') ? 3 : 2, -1) : argument;
                const entity = await (
                    type === ArgumentType.Channel ? Fetcher.getChannel(this.message.guildId!, id) :
                        type === ArgumentType.GuildMember ? Fetcher.getGuildMember(this.message.guildId!, id) :
                            Fetcher.getUser(id)
                );

                if (!optional && !entity) {
                    throw new InvalidArgumentException(errors?.["entity:null"] ?? `Argument #${index} evaluates to null`, index, "entity:null");
                }

                return entity as Argument<T, O>;

            case ArgumentType.Number:
            case ArgumentType.Integer:
                const radix = argument.startsWith('0x') ? 16 : argument.startsWith('0o') ? 8 : argument.startsWith('0b') ? 2 : 10;
                const num = radix !== 10 ? argument.slice(2) : argument;
                const value = type === ArgumentType.Number ? Number.parseFloat(num) : Number.parseInt(num);

                if (Number.isNaN(value)) {
                    throw new InvalidArgumentException(errors?.[`invalid:${type === ArgumentType.Number ? 'num' : 'int'}`] ?? `Argument #${index} is not a valid ${type === ArgumentType.Number ? 'number' : 'integer'}`, index, `invalid:${type === ArgumentType.Number ? 'num' : 'int'}`);
                }

                return value as Argument<T, O>;

            case ArgumentType.String:
                const ret = argument.trim();

                if (!ret) {
                    throw new InvalidArgumentException(errors?.['required'] ?? `Argument #${index} must not be empty`, index, "required");
                }

                return ret as Argument<T, O>;

            case ArgumentType.StringRest:
                const pastArgs = this.args.slice(0, index);
                const prefix: string = this.client.getService<ConfigService>('config').config(this.message.guildId)?.prefix ?? '!';
                let input = this.message.content
                    .toLowerCase()
                    .slice(prefix.length)
                    .trimStart()
                    .slice(this.commandName.length)
                    .trimStart();

                for (const arg of pastArgs) {
                    input = input.slice(arg.length).trimStart();
                }

                input = input.trimEnd();

                if (!input) {
                    throw new InvalidArgumentException(errors?.['required'] ?? `Argument #${index} must not be empty`, index, "required");
                }

                return input as Argument<T, O>;
        }

        return null as Argument<T, O>;
    }
}

export enum ArgumentType {
    String,
    StringRest,
    Number,
    Integer,
    User,
    Channel,
    GuildMember,
}

type Argument<T extends ArgumentType, O extends boolean = false> = {
    [ArgumentType.Channel]: O extends true ? GuildBasedChannel | null : GuildBasedChannel,
    [ArgumentType.Integer]: number,
    [ArgumentType.Number]: number,
    [ArgumentType.StringRest]: string,
    [ArgumentType.String]: string,
    [ArgumentType.User]: O extends true ? User | null : User,
    [ArgumentType.GuildMember]: O extends true ? GuildMember | null : GuildMember,
}[T] | (O extends false ? never : null);

type ErrorMessageTypes = "entity:null" | "required" | "invalid:num" | "invalid:int";
type ErrorMessages = {
    [K in ErrorMessageTypes]?: string;
};

export {
    Arguments,
    InvalidArgumentException
};