import { beforeEach, describe, expect, it, mock } from "bun:test";
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
        const { log, error, warn, debug, info } = console;
        const logMocked = mock();
        const errorMocked = mock();
        const warnMocked = mock();
        const debugMocked = mock();
        const infoMocked = mock();

        console.log = logMocked;
        console.error = errorMocked;
        console.warn = warnMocked;
        console.debug = debugMocked;
        console.info = infoMocked;

        logger.log(LogLevel.Info, "Booting...");

        console.log = log;
        console.error = error;
        console.warn = warn;
        console.debug = debug;
        console.info = info;

        expect(infoMocked.mock.calls.at(0)?.at(0)).toBe(chalk.blueBright(`${name}:info`));
        expect(infoMocked.mock.calls.at(0)?.at(1)).toBe("Booting...");
    });
});