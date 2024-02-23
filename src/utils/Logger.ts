import chalk from 'chalk';
import { isDevelopmentMode } from "./utils";

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
    Critical,
    Success
}

export class Logger {
    private readonly formatter = Intl.DateTimeFormat('en-US', {
        dateStyle: "long",
        timeStyle: "long"
    });

    public constructor(private readonly name: string, private readonly logTime: boolean = false) {}

    public log(level: LogLevel, ...args: unknown[]) {
        const levelName = LogLevel[level].toLowerCase();
        const methodName = level === LogLevel.Info ? 'info' : level === LogLevel.Success ? 'info' : level === LogLevel.Debug ? 'debug' : level === LogLevel.Warn ? 'warn' : 'error';
        const beginning = `${this.logTime ? `${chalk.gray(this.formatter.format(new Date()))} ` : ''}${this.colorize(`${this.name}:${levelName}`, level)}`;
        this.print(methodName, beginning, ...args);
    }

    public print(methodName: 'log' | 'info' | 'warn' | 'error' | 'debug', ...args: unknown[]) {
        if (process.env.SUPRESS_LOGS) {
            return;
        }

        console[methodName].call(console, ...args);
    }

    private colorize(text: string, level: LogLevel) {
        switch (level) {
            case LogLevel.Debug:
                return chalk.gray.dim(text);

            case LogLevel.Critical:
            case LogLevel.Fatal:
                return chalk.redBright(text);

            case LogLevel.Error:
                return chalk.red(text);

            case LogLevel.Warn:
                return chalk.yellowBright(text);

            case LogLevel.Info:
                return chalk.blueBright(text);

            case LogLevel.Success:
                return chalk.greenBright(text);
        }
    }

    public debug(...args: unknown[]) {
        if (!isDevelopmentMode()) {
            return;
        }

        this.log(LogLevel.Debug, ...args);
    }

    public info(...args: unknown[]) {
        this.log(LogLevel.Info, ...args);
    }

    public warn(...args: unknown[]) {
        this.log(LogLevel.Warn, ...args);
    }

    public error(...args: unknown[]) {
        this.log(LogLevel.Error, ...args);
    }

    public fatal(...args: unknown[]) {
        this.log(LogLevel.Fatal, ...args);
    }

    public critical(...args: unknown[]) {
        this.log(LogLevel.Critical, ...args);
    }

    public success(...args: unknown[]) {
        this.log(LogLevel.Success, ...args);
    }
}