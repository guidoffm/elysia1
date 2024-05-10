import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'

import { getUsers } from "./users";
import { bearerPlugin } from "./bearer-plugin";
import { createDaprClient } from "./dapr-client";
import { healthz, livez, readyz } from "./alive-checks";
import { onError } from "./on-error";
import { areTokenTimestampsValid, isTokenIssuerValid } from "./check-token";
import { JWTPayload } from "jose";
import { getAllZipCodes, radiusSearch } from "./radius-search";

export const NOT_FOUND = 'NOT_FOUND';
export const BEARER_TOKEN_REQUIRED = 'Bearer token is required';
export const INVALID_JWT = 'Invalid JWT';

const app = new Elysia()

  .get('/healthz', healthz)

  .get('/livez', livez)

  .get('/readyz', readyz)

  .use(bearer())

  .onError(({ code, error, set }) => { onError(code, error, set); })

  //verify and decode token
  .derive(async ({ bearer }) => { return { tokenData: await bearerPlugin(bearer) }; })

  // .onBeforeHandle(() => { console.log('step 1'); })

  // check if token exists
  .onBeforeHandle(({ set, tokenData }) => { if (!tokenData) { return (set.status = 401); } })

  // .onBeforeHandle(() => { console.log('step 2'); })

  // check if token dates are valid
  .onBeforeHandle(({ set, tokenData }) => { if (!areTokenTimestampsValid(tokenData as JWTPayload)) { return (set.status = 401); } })

  // check token issuer
  // This is not needed since it is done in the bearer plugin
  // .onBeforeHandle(({ set, tokenData }) => { if (!isTokenIssuerValid(tokenData as JWTPayload)) { return (set.status = 401); } })

    // .onBeforeHandle(() => { console.log('step 3'); })

  .derive(() => { return { daprClient: createDaprClient() }; })

  // .get("/api/test", async ({ daprClient }) => await daprClient.state.get('statestore', 'name'))

  // .get("/api/test/:key", async ({ daprClient, params }) => await daprClient.state.get('statestore', params.key))

  // .post("/api/test", (req) => req.headers)
  // .put("/api/test", (req) => req.body)
  // .delete("/api/test", (req) => req.body)
  // .get("/api/204", ({ set }) => {
  //   set.status = 204;
  // })



  .get('/api/users', async ({ daprClient }) => {
    return await getUsers(daprClient);
  })

  .get('/api/radius/:zip/:radius', async ({ daprClient, params }) => {
    return await radiusSearch(daprClient, params.zip, +params.radius);
  })

  .get('/api/zipcodes', async ({ daprClient }) => {
    return await getAllZipCodes(daprClient);
  })

  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);





