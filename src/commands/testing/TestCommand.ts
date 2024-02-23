import Command from "../../core/Command";
import { Awaitable } from "discord.js";

class TestCommand extends Command {
    public readonly name = 'test';
    public readonly description = 'Just a test command; for debugging purposes.';
    public readonly group = 'testing';
    public readonly syntax = '';

    public handle(): Awaitable<void> {
        this.client.logger.debug("test command was executed");
    }
}

export default TestCommand;