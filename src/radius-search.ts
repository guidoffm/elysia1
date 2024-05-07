import { DaprClient } from "@dapr/dapr";
import { NotFoundError } from "elysia";
import { DISTANCES_STORE, ZIP_CODES_STORE } from "./constants";


/**
 * Performs a radius search based on a given zip code and radius.
 * @param daprClient - The Dapr client used for querying and retrieving data.
 * @param zip - The zip code to search around.
 * @param radius - The radius in which to search for neighboring locations.
 * @returns An array of neighbor locations within the specified radius, including their zip code, location, and distance.
 * @throws NotFoundError if the provided zip code does not exist in the database.
 */
export async function radiusSearch(daprClient: DaprClient, zip: string, radius: number) {

    const location = await daprClient.state.query(ZIP_CODES_STORE, {
        filter: {
            EQ: { plz: zip }
        },
        page: {
            limit: 1000
        },
        sort: []
    });
    // console.log('location:', location);
    if (location.results.length === 0) {
        throw new NotFoundError();
    }

    const allNeighbors = (await daprClient.state.get(DISTANCES_STORE, location.results[0].key)) as [{value: number, loc_id:string}];
    // console.log('allNeighbors:', allNeighbors);
    const neighbors = allNeighbors.filter((neighbor) => neighbor.value <= radius);

    // console.log('neighbors:', neighbors);

    const neighborKeys = neighbors.map((neighbor) => neighbor.loc_id);
    // console.log('neighborKeys:', neighborKeys);

    const neighborLocations = await daprClient.state.getBulk(ZIP_CODES_STORE, neighborKeys);
    // console.log('neighborLocations:', neighborLocations);
    return neighborLocations.map((neighborLocation) => {return {plz: neighborLocation.data.plz, ort: neighborLocation.data.ort, distance: (neighbors as any[]).find((neighbor) => neighbor.loc_id === neighborLocation.key).value}});
}

/**
 * Retrieves all zip codes and corresponding locations from the specified Dapr state store.
 * @param daprClient - The Dapr client used to interact with the state store.
 * @returns An array of objects containing zip codes and corresponding locations.
 */
export async function getAllZipCodes(daprClient: DaprClient) {

    const items = await daprClient.state.query(ZIP_CODES_STORE, {
        filter: {},
        page: {
            limit: 10000
        },
        sort: []
    });
    return items.results.map((item) => { return {plz: item.data.plz, ort: item.data.ort}; });
}