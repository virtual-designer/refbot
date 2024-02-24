import Command from "../../core/Command";
import { Context } from "../../core/CommandContext";

class TestCommand extends Command {
    public readonly name = 'test';
    public readonly description = 'Just a test command; for debugging purposes.';
    public readonly group = 'testing';
    public readonly syntax = '';

    public async handle(context: Context) {
        await context.reply("Hello world");
    }
}

export default TestCommand;