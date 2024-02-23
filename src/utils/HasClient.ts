import Client from "../core/Client";

abstract class HasClient {
    public constructor(protected readonly client: Client) {}
}

export { HasClient };