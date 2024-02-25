import { beforeEach, describe, it } from "bun:test";
import { createClient } from "../client";
import ReferralService from "../../src/services/ReferralService";

describe("ReferralService", async () => {
    const client = await createClient();
    let service;

    beforeEach(() => {
        service = new ReferralService(client);
    });

    it('can be created', () => {
        new ReferralService(client);
    });
});