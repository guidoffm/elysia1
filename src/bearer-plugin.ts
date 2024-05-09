import * as jose from 'jose'
import { BEARER_TOKEN_REQUIRED } from '.';

export async function bearerPlugin(bearer?: string) {

  // console.log('bearer', bearer);
  if (!bearer) {
    throw new Error(BEARER_TOKEN_REQUIRED);
  }
  const jwToken = jose.decodeJwt(bearer);
  const iss = jwToken.iss;
  const configResponse = await fetch(`${iss}/.well-known/openid-configuration`);
  const oidcConfig = await (configResponse.json() as Promise<{ jwks_uri: string }>);
  const jwksUri = oidcConfig.jwks_uri;
  const jwksResponse = await fetch(jwksUri);
  const jwks = await (jwksResponse.json() as Promise<{ keys: any[] }>);
  const rsaPublicKey = await jose.importJWK(jwks.keys[0]);
  const tokenData = await jose.jwtVerify(bearer, rsaPublicKey, {
    issuer: process.env.ISSUER //'https://idsvr4.azurewebsites.net',
    // algorithms: ['RS256']
  });
  return tokenData.payload;
}