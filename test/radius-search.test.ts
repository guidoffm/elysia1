import { test, expect } from "bun:test";
import { createDaprClient } from "../src/dapr-client";
import { getAllZipCodes, radiusSearch } from "../src/radius-search";

test("radiusSearch1", async () => {
    const neighbors = await radiusSearch(createDaprClient(), '06849', 20000);
    expect(neighbors).toBeArray();
    console.log(JSON.stringify(neighbors, null, 2));
});

test("allZipCodes", async () => {
    const zipCodes = await getAllZipCodes(createDaprClient());
    expect(zipCodes).toBeArray();
    console.log(JSON.stringify(zipCodes, null, 2));
});
