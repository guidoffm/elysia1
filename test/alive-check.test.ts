import { expect, test } from "bun:test";
import { healthz, livez, readyz } from "../src/alive-checks";

test("healthz", () => {
    expect(healthz()).toBe('ok');
});

test("livez", () => {
    expect(livez()).toBe('ok');
});

test("readyz", () => {
    expect(readyz()).toBe('ok');
});

