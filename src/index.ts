import { Elysia, t } from "elysia";
import { bearer } from '@elysiajs/bearer'
import jwt, { type DecodeOptions, type Jwt, type JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { DaprClient } from "@dapr/dapr";

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

  .get('/healthz', () => 'Hello, Elysia!')
  .get('/livez', () => 'Hello, Elysia!')
  .get('/readyz', () => 'Hello, Elysia!')

  .use(bearer())

  .derive(async ({ bearer }) => {
    try {
      // console.log('bearer', bearer);
      if (!bearer) {
        throw new Error('Bearer token is required');
      }
      const jwtoken = jwt.decode(bearer, { complete: true } as DecodeOptions) as Jwt;
      const kid = jwtoken.header.kid;
      // console.log('kid', kid);
      const iss = (jwtoken.payload as JwtPayload).iss;
      // console.log('iss', iss);
      const configResponse = await fetch(`${iss}/.well-known/openid-configuration`);
      const data = await configResponse.json();
      // console.log('data', data);
      if (!(typeof data === 'object' && data && 'jwks_uri' in data && typeof data.jwks_uri === 'string')) {
        throw new Error('Invalid response from the issuer');
      }

      const jwksUri = data.jwks_uri;
      // console.log(jwksUri);
      const client = jwksClient({
        jwksUri: jwksUri,
        timeout: 3000,
        requestHeaders: {
          'user-agent': 'some-user-agent'
        }
      });
      // console.log('client', client);
      // console.log('kid', kid);
      const key = await client.getSigningKey(kid);
      // console.log('key', key);
      const signingKey = key.getPublicKey();
      const tokenData = jwt.verify(bearer, signingKey);
      return {
        tokenData: tokenData,
      };

    } catch (error) {
      console.error(error);
      return {
        tokenData: undefined
      };
    }
  })

  .onBeforeHandle(({ set, tokenData }) => {
    // console.log("beforeHandle", tokenData);
  })

  .derive(() => {
    return {
      daprClient: new DaprClient(),
    };
  })

  .get("/api/test", async ({ daprClient }) => await daprClient.state.get('statestore', 'name'), {
    async beforeHandle({ set, tokenData }) {
      // console.log("beforeHandle", tokenData);
    }
  })

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
