import { HasClient } from "../utils/HasClient";
import { Awaitable } from "discord.js";

abstract class Service extends HasClient {
    public abstract readonly name: string;

    boot(): Awaitable<void> {}
}

export default Service;