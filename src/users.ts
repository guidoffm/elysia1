import { DaprClient } from "@dapr/dapr";
import { NotFoundError } from "elysia";
import { USERS_STORE } from "./constants";

export async function getUsers(daprClient: DaprClient) {
    return await daprClient.state.query(USERS_STORE, {
        filter: {},
        page: {
            limit: 100
        },
        sort: []
    })
}
export async function getUser(daprClient: DaprClient, key: string) {
    const user = await daprClient.state.get(USERS_STORE, key);
    if (!user) {
        throw new NotFoundError();
    }
    return user;
}