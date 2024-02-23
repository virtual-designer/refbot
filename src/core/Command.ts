import { HasClient } from "../utils/HasClient";
import { Awaitable } from "discord.js";

abstract class Command extends HasClient {
    public abstract readonly name: string;
    public abstract readonly group: string;
    public abstract readonly description: string;
    public abstract readonly syntax: string;
    public readonly aliases: string[] = [];

    abstract handle(): Awaitable<void>;
}

export default Command;