import { DaprClient } from "@dapr/dapr";
import { NotFoundError } from "elysia";

export async function getUsers(daprClient: DaprClient) {
    return await daprClient.state.query('userstore2', {
        filter: {},
        page: {
            limit: 100
        },
        sort: []
    })
}
export async function getUser(daprClient: DaprClient, key: string) {
    const user = await daprClient.state.get('userstore2', key);
    if (!user) {
        throw new NotFoundError();
    }
    return user;
}