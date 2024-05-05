import { expect, test } from "bun:test";
import { areTokenTimestampsValid, isTokenIssuerValid } from "../src/check-token";

test("isTokenIssuerValid", () => {
    const res = isTokenIssuerValid({ iss: 'https://idsvr4.azurewebsites.net' });
    expect(res).toBeTrue();
});

test("isTokenIssuerValid2", () => {
    const res = isTokenIssuerValid({ iss: 'foo' });
    expect(res).toBeFalse();
});


test("areTokenTimestampsValid", () => {
    const res = areTokenTimestampsValid({});
    expect(res).toBeBoolean();
});

