import { DaprClient } from "@dapr/dapr";
import { NOT_FOUND } from ".";

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
        throw new Error(NOT_FOUND);
    }
    return user;
}