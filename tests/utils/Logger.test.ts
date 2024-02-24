import { beforeEach, describe, expect, it, mock, test } from "bun:test";
import { Logger, LogLevel } from "../../src/utils/Logger";
import chalk from 'chalk';

describe("Logger", () => {
    let logger: Logger;
    const name = 'system-' + (Math.round(Math.random() * 5));

    beforeEach(() => {
        logger = new Logger(name, false);
    });

    it('can be created', () => {
        new Logger('random_name', true);
        new Logger('random_name', false);
    });

    it('can create log messages', () => {
        const NODE_ENV = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        type MessageInfo = {
            message: string;
            chalkMethod: (text: string) => string,
            level: LogLevel;
        };

        const methods = {
            info: 'info',
            warn: 'warn',
            debug: 'debug',
            error: 'error',
            fatal: 'error',
            critical: 'error',
            success: 'info'
        } as const;
        const messages: Record<keyof typeof methods, MessageInfo> = {
            critical: {
                message: "Critical message",
                chalkMethod: chalk.redBright,
                level: LogLevel.Critical
            },
            fatal: {
                message: "Fatal error message",
                chalkMethod: chalk.redBright,
                level: LogLevel.Fatal
            },
            debug: {
                message: "Debug message",
                chalkMethod: chalk.gray.dim,
                level: LogLevel.Debug
            },
            info: {
                message: "Info message",
                chalkMethod: chalk.blueBright,
                level: LogLevel.Info
            },
            warn: {
                message: "Warning message",
                chalkMethod: chalk.yellowBright,
                level: LogLevel.Warn
            },
            error: {
                message: "Error message",
                chalkMethod: chalk.red,
                level: LogLevel.Error
            },
            success: {
                message: "Success message",
                chalkMethod: chalk.greenBright,
                level: LogLevel.Success
            },
        };
        const originalFns: Record<string, Function> = {};

        for (const method in methods) {
            const consoleMethodName = methods[method as keyof typeof methods];
            const inferredMethodName = method as keyof typeof messages;
            const fn = console[consoleMethodName];
            const messageInfo = messages[inferredMethodName];
            const mockFn = mock();
            console[consoleMethodName] = mockFn;
            originalFns[method] = fn;
            logger[inferredMethodName].call(logger, messageInfo.message);
            console[consoleMethodName] = originalFns[method] as (typeof console)[typeof consoleMethodName];
            const namespace = messageInfo.chalkMethod(name + ':' + LogLevel[messageInfo.level].toLowerCase());
            expect(mockFn.mock.lastCall?.[0]).toBe(namespace);
        }

        process.env.NODE_ENV = NODE_ENV;
    });

    test('debug logs are hidden in production', () => {
        const values = ['production', undefined, 'prod'];
        const { NODE_ENV } = process.env;
        const mockFn = mock();
        const { debug } = console;

        console.debug = mockFn;

        for (const value of values) {
            process.env.NODE_ENV = value;
            logger.debug("Debug log");
        }

        console.debug = debug;
        process.env.NODE_ENV = NODE_ENV;
        expect(mockFn.mock.calls.length).toBe(0);
    });
});