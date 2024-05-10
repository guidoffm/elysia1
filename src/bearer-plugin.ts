import * as jose from 'jose'
import { BEARER_TOKEN_REQUIRED } from '.';

/**
 * Check if bearer token is valid
 * @param bearer 
 * @returns JWTPayload or undefined if token is invalid
 */
export async function bearerPlugin(bearer?: string): Promise<jose.JWTPayload | undefined> {
  try {
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
    const options: jose.JWTVerifyOptions = {
      algorithms: ['RS256']
    };
    if (process.env.ISSUER) {
      options['issuer'] = process.env.ISSUER;
    }
    const tokenData = await jose.jwtVerify(bearer, rsaPublicKey, options);
    // console.log('tokenData', tokenData);
    return tokenData.payload;
  } catch (error) {
    console.log('error', error);
    return undefined;
  }
}