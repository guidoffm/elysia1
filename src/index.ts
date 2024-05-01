import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
import { DaprClient, LogLevel, LoggerOptions } from "@dapr/dapr";
import * as jose from 'jose'

const app = new Elysia()

  // .get("/", (req) => JSON.stringify(req), {
  //   beforeHandle(context) {
  //     console.log("beforeHandle", context);
  //     context.set = {
  //       headers: {
  //         "Content-Type": "text/html"
  //       }
  //     };
  //   },
  // })

  .get('/healthz', () => {
    console.log('healthz');
    return ('ok');
  })
  .get('/livez', () => {
    console.log('livez');
    return ('ok');
  })
  .get('/readyz', () => {
    console.log('readyz');
    return ('ok');
  })

  .use(bearer())

  //verify and decode token
  .derive(async ({ bearer }) => {
    try {
      // console.log('bearer', bearer);
      if (!bearer) {
        throw new Error('Bearer token is required');
      }
      const jwToken = jose.decodeJwt(bearer);
      const iss = jwToken.iss;
      const configResponse = await fetch(`${iss}/.well-known/openid-configuration`);
      const oidcConfig = await (configResponse.json() as Promise<{ jwks_uri: string }>);
      const jwksUri = oidcConfig.jwks_uri;
      const jwksResponse = await fetch(jwksUri);
      const jwks = await (jwksResponse.json() as Promise<{ keys: any[] }>);
      // console.log('jwks', jwks);
      const rsaPublicKey = await jose.importJWK(jwks.keys[0]);
      const tokenData = await jose.jwtVerify(bearer, rsaPublicKey, {
        // issuer: 'https://idsvr4.azurewebsites.net',
        // algorithms: ['RS256']
      });
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
      daprClient: new DaprClient({
        daprPort: process.env.DAPR_HTTP_PORT || '3500',
        daprHost: process.env.DAPR_HTTP_HOST || 'localhost',
        logger: {
          logLevel: LogLevel.Debug,
          logToConsole: true,
        } as LoggerOptions,
      }),
    };
  })

  .get("/api/test", async ({ daprClient }) => await daprClient.state.get('statestore', 'name'))

  .get("/api/test/:key", async ({ daprClient, params }) => await daprClient.state.get('statestore', params.key))

  .post("/api/test", (req) => req.headers)
  .put("/api/test", (req) => req.body)
  .delete("/api/test", (req) => req.body)
  .get("/api/204", ({ set }) => {
    set.status = 204;
  })

  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
