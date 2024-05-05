import { expect, test } from "bun:test";
import { bearerPlugin } from "../src/bearer-plugin";
import { INVALID_JWT } from "../src";

test('bearer-plugin-no-token', async () => {
    try {
        await bearerPlugin(undefined)
    } catch (e: any) {
        expect(e.message).toBe('Bearer token is required');
    }
});

test('bearer-plugin-wrong-token', async () => {
    try {
        await bearerPlugin('foo')
    } catch (e: any) {
        expect(e.message).toBe(INVALID_JWT);
    }
});