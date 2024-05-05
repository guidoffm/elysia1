import { expect, test } from "bun:test";
import { onError } from "../src/on-error";

test('on-error', () => {
    const ctx ={ headers: {} };
    onError('', { message: 'error' }, ctx);
});

test('on-error2', () => {
    const ctx ={ headers: {}, status: 200 };
    const res = onError('NOT_FOUND', { message: 'error' }, ctx);
    expect(res).toEqual('Not Found');
    expect(ctx.status).toEqual(404);
});