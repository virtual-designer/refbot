import { HasClient } from "../utils/HasClient";
import { Awaitable, ClientEvents } from "discord.js";

abstract class EventListener<E extends keyof ClientEvents> extends HasClient {
    public abstract readonly name: E;
    public abstract handle(...args: ClientEvents[E]): Awaitable<void>;
}

export default EventListener;