import { expect, test } from "bun:test";
import { onError } from "../src/on-error";

test('on-error', () => {
    onError({ message: 'error' }, { headers: {} });
    // expect(res).toBeObject();
});