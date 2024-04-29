import { Elysia } from "elysia";
import { bearer } from '@elysiajs/bearer'
// import jwt from "@elysiajs/jwt";
import jwt, { type DecodeOptions, type Jwt, type JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const app = new Elysia()



  // .use(jwt({
  //   secret: 'secret',
  // }))

  .get("/", (req) => JSON.stringify(req), {
    beforeHandle(context) {
      console.log("beforeHandle", context);
      context.set = {
        headers: {
          "Content-Type": "text/html"
        }
      };
    },
  })

  .use(bearer())

  .derive(async ({ bearer }) => {
    // console.log('bearer', bearer);
    if (!bearer) {
      return {
        tokenData: undefined
      };
    }
    const jwtoken = jwt.decode(bearer, { complete: true } as DecodeOptions) as Jwt;
    const kid = jwtoken.header.kid;
    // console.log('kid', kid);
    const iss = (jwtoken.payload as JwtPayload).iss;
    // console.log('iss', iss);
    const configResponse = await fetch(`${iss}/.well-known/openid-configuration`);
    const data = await configResponse.json();
    // console.log('data', data);
    if (typeof data === 'object' && data && 'jwks_uri' in data && typeof data.jwks_uri === 'string') {
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
    } else {
      return {
        tokenData: undefined
      };

    }
    // console.error('Invalid data');
    // throw new Error('Invalid data');
  })
  .onBeforeHandle(({ set, tokenData }) => {
    console.log("beforeHandle", tokenData);
  })

  .get("/api/test", (req) => req.bearer, {
    async beforeHandle({ set, tokenData }) {
      console.log("beforeHandle", tokenData);
    }
  })

  .get("/api/test/:id", (req) => req.params.id)
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
