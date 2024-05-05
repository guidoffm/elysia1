import { JWTPayload } from "jose";

export function isTokenIssuerValid(tokenData: JWTPayload) {
  return tokenData.iss === 'https://idsvr4.azurewebsites.net';
}

/**
 * 
 * @param tokenData 
 * @returns 
 */
export function areTokenTimestampsValid(tokenData: JWTPayload ) {
  const nbfDate = new Date((tokenData?.nbf as number) * 1000);
  const expDate = new Date((tokenData?.exp as number) * 1000);
  const now = new Date();
  return nbfDate < now &&  now < expDate;
}
