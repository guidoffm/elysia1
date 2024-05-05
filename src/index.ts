import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { DaprClient, LogLevel, LoggerOptions } from "@dapr/dapr";

import { getUsers } from "./users";
import { bearerPlugin } from "./bearer-plugin";
import { createDaprClient } from "./dapr-client";
import { healthz, livez, readyz } from "./alive-checks";

export const NOT_FOUND = 'NOT_FOUND';
export const BEARER_TOKEN_REQUIRED = 'Bearer token is required';
export const INVALID_JWT = 'Invalid JWT'

const app = new Elysia()

  .get('/healthz', healthz)

  .get('/livez', livez)

  .get('/readyz', readyz)

  .use(bearer())

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
  .onBeforeHandle(({ set, tokenData, body }) => {
    if (!tokenData) {
      set.status = 401;
      body = 'Invalid token';
    }
  })

  // check if token dates are valid
  .onBeforeHandle(({ set, tokenData, body }) => {
    const nbfDate = new Date((tokenData?.nbf as number) * 1000);
    const expDate = new Date((tokenData?.exp as number) * 1000);
    if (nbfDate > new Date()) {
      set.status = 401;
      body = 'Token is not yet valid';
    } else if (expDate < new Date()) {
      set.status = 401;
      body = 'Token has expired';
    }
  })

  // check token issuer
  .onBeforeHandle(({ set, tokenData, body }) => {
    if (tokenData?.iss !== 'https://idsvr4.azurewebsites.net') {
      set.status = 401;
      body = 'Invalid token issuer';
    }
  })

  .derive(() => {
    return {
      daprClient: createDaprClient()
    };
  })

  .get("/api/test", async ({ daprClient }) => await daprClient.state.get('statestore', 'name'))

  .get("/api/test/:key", async ({ daprClient, params }) => await daprClient.state.get('statestore', params.key))

  // .post("/api/test", (req) => req.headers)
  // .put("/api/test", (req) => req.body)
  // .delete("/api/test", (req) => req.body)
  // .get("/api/204", ({ set }) => {
  //   set.status = 204;
  // })

  .onError(({ error, set }) => {
    console.error(error);
    set.status = 404;
  })

  .get('/api/users', async ({ daprClient }) => {
    return await getUsers(daprClient);
  })

  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
