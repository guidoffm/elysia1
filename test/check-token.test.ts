import { expect, test } from "bun:test";
import { checkTokenExists, checkTokenExpiration, checkTokenIssuer } from "../src/check-token";

test("checkTokenIssuer", () => {
    checkTokenIssuer({ iss: 'https://idsvr4.azurewebsites.net' }, { headers: {} }, {});
    // expect(res).toBeUndefined();
});

test("checkTokenIssuer2", () => {
    checkTokenIssuer({ iss: 'foo' }, { headers: {} }, {});
    // expect(res).toEqual('Invalid token issuer');
});


test("checkTokenExpiration", () => {
    checkTokenExpiration({  }, { headers: {} }, {});
    // expect(res).toBeObject();
});

test("checkTokenIssuer", () => {
    checkTokenIssuer({ iss: 'https://idsvr4.azurewebsites.net' }, { headers: {} }, {});
    // expect(res).toBeObject();
});

test("checkTokenExists", () => {
    checkTokenExists(undefined, { headers: {} }, {});
    // expect(res).toEqual('Invalid token');
});