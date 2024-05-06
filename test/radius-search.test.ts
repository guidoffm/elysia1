import { test, expect } from "bun:test";
import { createDaprClient } from "../src/dapr-client";
import { radiusSearch } from "../src/radius-search";

test("radiusSearch1", async () => {
    const neighbors = await radiusSearch(createDaprClient(), '06849', 20000);
    expect(neighbors).toBeArray();
    console.log(JSON.stringify(neighbors, null, 2));
});