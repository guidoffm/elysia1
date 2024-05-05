import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'

import { getUsers } from "./users";
import { bearerPlugin } from "./bearer-plugin";
import { createDaprClient } from "./dapr-client";
import { healthz, livez, readyz } from "./alive-checks";
import { onError } from "./on-error";
import { areTokenTimestampsValid, isTokenIssuerValid } from "./check-token";
import { JWTPayload } from "jose";

export const NOT_FOUND = 'NOT_FOUND';
export const BEARER_TOKEN_REQUIRED = 'Bearer token is required';
export const INVALID_JWT = 'Invalid JWT';

// function fooPlugin(): Promise<{ default: Elysia }> {
//   return Promise.resolve({ default: new Elysia() });
// }

const app = new Elysia()

  .get('/healthz', healthz)

  .get('/livez', livez)

  .get('/readyz', readyz)

  .use(bearer())

  // .use(fooPlugin())

  //verify and decode token
  .derive(async ({ bearer }) => {
    try {
      const tokenData = await bearerPlugin(bearer);
      return {
        tokenData: tokenData.payload,
      };

    } catch (error) {
      console.error(error);
      return {
        tokenData: undefined
      };
    }
  })

  // check if token exists
  .onBeforeHandle(({ set, tokenData }) => {
    if (!tokenData) {
      return (set.status = 401);
    }
  })

  // check if token dates are valid
  .onBeforeHandle(({ set, tokenData }) => {
    if (!areTokenTimestampsValid(tokenData as JWTPayload)) {
      return (set.status = 401);
    }
  })

  // check token issuer
  .onBeforeHandle(({ set, tokenData }) => {
    console.log('isTokenIssuerValid');
    if (!isTokenIssuerValid(tokenData as JWTPayload)) {
      return (set.status = 401);
    }
  })

  .derive(() => { return { daprClient: createDaprClient() }; })

  .get("/api/test", async ({ daprClient }) => await daprClient.state.get('statestore', 'name'))

  .get("/api/test/:key", async ({ daprClient, params }) => await daprClient.state.get('statestore', params.key))

  // .post("/api/test", (req) => req.headers)
  // .put("/api/test", (req) => req.body)
  // .delete("/api/test", (req) => req.body)
  // .get("/api/204", ({ set }) => {
  //   set.status = 204;
  // })

  .onError(({ code, error, set }) => { onError(code, error, set); })

  .get('/api/users', async ({ daprClient }) => {
    return await getUsers(daprClient);
  })

  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);





