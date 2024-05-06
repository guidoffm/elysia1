import { getUser, getUsers } from "../src/users";
import { expect, test } from "bun:test";
import { KeyValueType } from "@dapr/dapr/types/KeyValue.type";
import { NOT_FOUND } from "../src";
import { createDaprClient } from "../src/dapr-client";


test("testGetUsers", async () => {
    const users = await getUsers(createDaprClient());
    expect(users.results).toBeArrayOfSize(10);
    console.log(JSON.stringify(users, null, 2));
});

test("testGetUser", async () => {
    const user = await getUser(createDaprClient(), '10') as KeyValueType;
    expect(user).toBeObject();
    // console.log(JSON.stringify(user, null, 2)); 
    expect(user.city).toBe('New York');
    expect(user.state).toBe('NY');
});

test("testGetUserNotFound", async () => {
    try {
        await getUser(createDaprClient(), '1000');
    } catch (e: any) {
        expect(e.message).toBe(NOT_FOUND);
    }
});