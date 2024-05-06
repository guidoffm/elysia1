import { DaprClient } from "@dapr/dapr";

export async function radiusSearch(daprClient: DaprClient, zip: string, radius: number) {

    const location = await daprClient.state.query("plzstore", {
        filter: {
            EQ: { plz: zip }
        },
        page: {
            limit: 1000
        },
        sort: []
    });
    // console.log('location:', location);

    const allNeighbors = (await daprClient.state.get("distances", location.results[0].key)) as [{value: number, loc_id:string}];
    // console.log('allNeighbors:', allNeighbors);
    const neighbors = allNeighbors.filter((neighbor) => neighbor.value <= radius);

    // console.log('neighbors:', neighbors);

    const neighborKeys = neighbors.map((neighbor) => neighbor.loc_id);
    // console.log('neighborKeys:', neighborKeys);

    const neighborLocations = await daprClient.state.getBulk("plzstore", neighborKeys);
    // console.log('neighborLocations:', neighborLocations);
    return neighborLocations;
}